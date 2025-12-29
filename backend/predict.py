"""
Eye Test Prediction Script
Loads ML model and predicts eye condition from image with eye side detection
"""
import sys
import os
import cv2
import numpy as np

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf

# Import eye side detector
sys.path.append(os.path.join(os.path.dirname(__file__), '../python-eye'))
try:
    from eye_side_detector import EyeSideDetector
    EYE_SIDE_AVAILABLE = True
except ImportError:
    EYE_SIDE_AVAILABLE = False
    print("Warning: Eye side detection not available")

# Check if correct arguments provided
if len(sys.argv) < 2:
    print("Error: Image path required")
    sys.exit(1)

image_path = sys.argv[1]
model_path = sys.argv[2] if len(sys.argv) > 2 else "../python-eye/model.h5"

# Normalize paths
image_path = os.path.abspath(image_path)
model_path = os.path.abspath(model_path)

# Validate image exists
if not os.path.exists(image_path):
    print(f"Error: Image not found at {image_path}")
    sys.exit(1)

# Validate model exists
if not os.path.exists(model_path):
    print(f"Error: Model not found at {model_path}")
    print(f"Searched at: {model_path}")
    sys.exit(1)

# Categories for prediction
CATEGORIES = [
    "Normal (0)",
    "Mild Myopia (-0.5 to -1.5)",
    "Moderate Myopia (-2 to -3)",
    "Severe Myopia (-3.5 to -5)"
]

try:
    # Detect eye side first
    eye_side = "Unknown"
    if EYE_SIDE_AVAILABLE:
        try:
            detector = EyeSideDetector()
            eye_side = detector.detect_simple(image_path)
        except Exception as side_error:
            print(f"Warning: Eye side detection failed - {side_error}", file=sys.stderr)
            eye_side = "Unknown"
    
    # Load model with error handling
    try:
        model = tf.keras.models.load_model(model_path, compile=False)
        # Verify model is valid
        if model is None:
            print(f"Error: Model loaded but is None")
            sys.exit(1)
    except OSError as os_error:
        print(f"Error: Model file is corrupted or invalid - {str(os_error)}")
        print(f"Please regenerate the model by running: python eye-test/python-eye/create_dummy_model.py")
        sys.exit(1)
    except Exception as model_error:
        print(f"Error: Failed to load model - {str(model_error)}")
        sys.exit(1)
    
    # Read and preprocess image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Failed to read image at {image_path}")
        sys.exit(1)
    
    # Convert BGR to RGB if needed
    if len(img.shape) == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize and normalize
    img = cv2.resize(img, (128, 128))
    img = img.astype(np.float32) / 255.0
    img = np.reshape(img, (1, 128, 128, 3))
    
    # Make prediction
    prediction = model.predict(img, verbose=0)
    index = np.argmax(prediction)
    confidence = float(prediction[0][index]) * 100
    
    # Output result with eye side
    result = CATEGORIES[index]
    if eye_side != "Unknown":
        print(f"{eye_side} - {result} (Confidence: {confidence:.1f}%)")
    else:
        print(f"{result} (Confidence: {confidence:.1f}%)")
    
except KeyboardInterrupt:
    print("Error: Prediction interrupted")
    sys.exit(1)
except Exception as e:
    print(f"Error during prediction: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
