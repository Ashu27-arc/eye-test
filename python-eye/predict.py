"""
Eye Test Prediction Script
Standalone prediction script for testing
"""
import sys
import os
import cv2
import numpy as np
import tensorflow as tf

CATEGORIES = [
    "Normal (0)",
    "Mild Myopia (-0.5 to -1.5)",
    "Moderate Myopia (-2 to -3)",
    "Severe Myopia (-3.5 to -5)"
]

def predict_eye(image_path, model_path='model.h5'):
    """
    Predict eye condition from image
    
    Args:
        image_path: Path to eye image
        model_path: Path to trained model
        
    Returns:
        Prediction result string
    """
    try:
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
        return f"{result} (Confidence: {confidence:.1f}%)"
        
    except Exception as e:
        return f"Error: {str(e)}"

# Command line usage
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path> [model_path]")
        print("Example: python predict.py test_eye.jpg model.h5")
        sys.exit(1)
    
    image_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else 'model.h5'
    
    result = predict_eye(image_path, model_path)
    print("👁 Eye Result:", result)
