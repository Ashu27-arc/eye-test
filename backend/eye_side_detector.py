"""
Eye Side Detection Module
Detects whether an eye image is Left or Right eye
"""
import cv2
import numpy as np
import mediapipe as mp

class EyeSideDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
    
    def detect_eye_side(self, image_path):
        """
        Detect if the eye image is left or right eye
        
        Args:
            image_path: Path to eye image
            
        Returns:
            str: "Left Eye" or "Right Eye" or "Unknown"
        """
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                return self._detect_by_brightness(image_path)
            
            # Convert to RGB
            rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Try face mesh detection first
            results = self.face_mesh.process(rgb_img)
            
            if results.multi_face_landmarks:
                return self._detect_with_landmarks(results.multi_face_landmarks[0], img.shape)
            else:
                # Fallback to brightness-based detection
                return self._detect_by_brightness_array(img)
                
        except Exception as e:
            print(f"Detection error: {e}")
            return "Unknown"
    
    def _detect_with_landmarks(self, landmarks, img_shape):
        """Detect eye side using facial landmarks"""
        h, w = img_shape[:2]
        
        # Left eye indices: 33, 133, 160, 159, 158, 157, 173
        # Right eye indices: 362, 263, 387, 386, 385, 384, 398
        
        left_eye_x = np.mean([landmarks.landmark[i].x for i in [33, 133, 160, 159]])
        right_eye_x = np.mean([landmarks.landmark[i].x for i in [362, 263, 387, 386]])
        
        # Calculate center of image
        center_x = 0.5
        
        # Determine which eye is more prominent
        left_dist = abs(left_eye_x - center_x)
        right_dist = abs(right_eye_x - center_x)
        
        if left_dist < right_dist:
            return "Left Eye"
        else:
            return "Right Eye"
    
    def _detect_by_brightness_array(self, img):
        """Detect eye side based on brightness distribution"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        
        # Split image into left and right halves
        left_half = gray[:, :w//2]
        right_half = gray[:, w//2:]
        
        # Calculate brightness
        left_brightness = np.mean(left_half)
        right_brightness = np.mean(right_half)
        
        # Eye pupil is darker, so the side with lower brightness likely has the pupil
        if left_brightness < right_brightness:
            return "Right Eye"  # Pupil on left means right eye
        else:
            return "Left Eye"  # Pupil on right means left eye
    
    def _detect_by_brightness(self, image_path):
        """Fallback brightness detection"""
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return "Unknown"
        
        h, w = img.shape
        left_half = img[:, :w//2]
        right_half = img[:, w//2:]
        
        left_brightness = np.mean(left_half)
        right_brightness = np.mean(right_half)
        
        if left_brightness < right_brightness:
            return "Right Eye"
        else:
            return "Left Eye"
    
    def detect_simple(self, image_path):
        """
        Simple detection without MediaPipe (faster but less accurate)
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                return "Unknown"
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            h, w = gray.shape
            
            # Find darkest region (pupil)
            _, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
            
            # Find contours
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Find largest contour (likely pupil)
                largest_contour = max(contours, key=cv2.contourArea)
                M = cv2.moments(largest_contour)
                
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    
                    # Determine side based on pupil position
                    if cx < w // 2:
                        return "Right Eye"  # Pupil on left side = right eye
                    else:
                        return "Left Eye"  # Pupil on right side = left eye
            
            # Fallback to brightness
            return self._detect_by_brightness_array(img)
            
        except Exception as e:
            print(f"Simple detection error: {e}")
            return "Unknown"

# Standalone usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python eye_side_detector.py <image_path>")
        sys.exit(1)
    
    detector = EyeSideDetector()
    result = detector.detect_simple(sys.argv[1])
    print(f"👁 Detected: {result}")
