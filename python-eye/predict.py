"""
Eye Test Prediction Script
Standalone prediction script for testing with eye side detection
"""
import sys
import os
import cv2
import numpy as np
import tensorflow as tf
from eye_side_detector import EyeSideDetector

CATEGORIES = [
    "Normal (0)",
    "Mild Myopia (-0.5 to -1.5)",
    "Moderate Myopia (-2 to -3)",
    "Severe Myopia (-3.5 to -5)"
]

def predict_eye(image_path, model_path='model.h5', detect_side=True):
    """
    Predict eye condition from image with eye side detection
    
    Args:
        image_path: Path to eye image
        model_path: Path to trained model
        detect_side: Whether to detect eye side (left/right)
        
    Returns:
        Prediction result string with eye side
    """
    try:
        # Detect eye side
        eye_side = "Unknown"
        if detect_side:
            try:
                detector = EyeSideDetector()
                eye_side = detector.detect_simple(image_path)
            except Exception as side_error:
                print(f"Warning: Eye side detection failed - {side_error}")
                eye_side = "Unknown"
        
        # Load model
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        model = tf.keras.models.load_model(model_path)
        
        # Read and preprocess image
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")
        
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Failed to read image at {image_path}")
        
        img = cv2.resize(img, (128, 128))
        img = img / 255.0
        img = np.reshape(img, (1, 128, 128, 3))
        
        # Make prediction
        prediction = model.predict(img, verbose=0)
        index = np.argmax(prediction)
        confidence = float(prediction[0][index]) * 100
        
        result = CATEGORIES[index]
        
        # Combine eye side with result
        if eye_side != "Unknown":
            return f"{eye_side} - {result} (Confidence: {confidence:.1f}%)"
        else:
            return f"{result} (Confidence: {confidence:.1f}%)"
        
    except Exception as e:
        return f"Error: {str(e)}"

# Command line usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path> [model_path] [--no-side]")
        print("Example: python predict.py test_eye.jpg model.h5")
        print("         python predict.py test_eye.jpg --no-side")
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = 'model.h5'
    detect_side = True
    
    # Parse arguments
    for arg in sys.argv[2:]:
        if arg == '--no-side':
            detect_side = False
        elif not arg.startswith('--'):
            model_path = arg
    
    result = predict_eye(image_path, model_path, detect_side)
    print("👁 Eye Result:", result)
