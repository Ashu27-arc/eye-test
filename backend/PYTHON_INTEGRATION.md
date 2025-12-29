# Python Integration Guide

## Overview

The backend integrates with Python ML model for eye condition prediction. This document explains the connection and troubleshooting.

## Architecture

```
Node.js Backend (Express)
    │
    ├─► Receives image upload
    │
    ├─► Saves to uploads/
    │
    ├─► Calls Python script via child_process
    │       │
    │       └─► predict.py
    │               │
    │               ├─► Loads model.h5
    │               ├─► Preprocesses image
    │               ├─► Makes prediction
    │               └─► Returns result
    │
    └─► Returns JSON response to client
```

## Configuration

### Environment Variables (.env)

```env
PYTHON_SCRIPT_PATH=./predict.py
MODEL_PATH=../python-eye/model.h5
```

### Python Script (predict.py)

**Location**: `backend/predict.py`

**Usage**:
```bash
python predict.py <image_path> <model_path>
```

**Arguments**:
- `image_path` (required): Path to eye image
- `model_path` (optional): Path to model.h5 (default: ../python-eye/model.h5)

**Output**: Prediction result printed to stdout

**Example**:
```bash
python predict.py uploads/1234567890-eye.jpg ../python-eye/model.h5
# Output: Mild Myopia (-0.5 to -1.5) (Confidence: 87.3%)
```

## Testing Connection

### Quick Test

Run the test script:
```bash
node test-python.js
```

This checks:
1. ✅ Python installation
2. ✅ Python script exists
3. ✅ ML model exists
4. ✅ Python dependencies installed
5. ✅ Script syntax is valid

### Manual Test

```bash
# 1. Check Python
python --version

# 2. Test prediction script
cd backend
python predict.py ../python-eye/test_eye.jpg ../python-eye/model.h5

# 3. Check dependencies
python -c "import tensorflow, cv2, numpy"
```

## Python Dependencies

Required packages (from `python-eye/requirements.txt`):
- `tensorflow` - ML framework
- `opencv-python` - Image processing
- `numpy` - Numerical operations

### Installation

```bash
# Option 1: Using pip
pip install tensorflow opencv-python numpy

# Option 2: Using requirements.txt
cd python-eye
pip install -r requirements.txt

# Option 3: Using virtual environment (recommended)
cd python-eye
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

## How It Works

### 1. Image Upload Flow

```javascript
// controllers/eyeTestController.js
exports.predictEye = (req, res) => {
    const imagePath = path.join(__dirname, "..", req.file.path);
    const pythonScript = config.ml.pythonScript;
    const modelPath = config.ml.modelPath;
    
    // Execute Python script
    exec(`python ${pythonScript} ${imagePath} ${modelPath}`, 
        (error, stdout, stderr) => {
            // Handle result
            const result = stdout.trim();
            res.json({ success: true, result });
        }
    );
};
```

### 2. Python Processing

```python
# predict.py
# 1. Load model
model = tf.keras.models.load_model(model_path)

# 2. Preprocess image
img = cv2.imread(image_path)
img = cv2.resize(img, (128, 128))
img = img / 255.0
img = np.reshape(img, (1, 128, 128, 3))

# 3. Predict
prediction = model.predict(img, verbose=0)
index = np.argmax(prediction)

# 4. Output result
print(CATEGORIES[index])
```

## Troubleshooting

### Python Not Found

**Error**: `'python' is not recognized`

**Solution**:
1. Install Python from https://www.python.org/downloads/
2. Add Python to PATH during installation
3. Restart terminal/IDE

### Dependencies Missing

**Error**: `ModuleNotFoundError: No module named 'tensorflow'`

**Solution**:
```bash
pip install tensorflow opencv-python numpy
```

### Model Not Found

**Error**: `Model not found at ../python-eye/model.h5`

**Solution**:
```bash
cd python-eye
python train.py  # Train the model first
```

### Image Processing Error

**Error**: `Failed to read image`

**Solution**:
- Check image format (JPEG/PNG only)
- Verify file is not corrupted
- Check file permissions

### Prediction Timeout

**Error**: Request timeout

**Solution**:
- First prediction is slow (model loading)
- Increase timeout in api.ts (currently 60s)
- Check Python script performance

## Performance Optimization

### 1. Keep Model Loaded (Advanced)

Instead of loading model on each request, use a Python server:

```python
# server.py (example)
from flask import Flask, request
import tensorflow as tf

app = Flask(__name__)
model = tf.keras.models.load_model('model.h5')  # Load once

@app.route('/predict', methods=['POST'])
def predict():
    # Process image and return prediction
    pass
```

### 2. Use GPU Acceleration

If available, TensorFlow will automatically use GPU for faster predictions.

## Security Considerations

1. ✅ File validation (type, size) in middleware
2. ✅ Temporary file cleanup after processing
3. ✅ Path sanitization to prevent directory traversal
4. ⚠️ Consider rate limiting for production
5. ⚠️ Add authentication for production API

## Monitoring

### Logs to Watch

```bash
# Backend logs
📸 Received prediction request
✅ File received: 1234567890-eye.jpg 45678 bytes
🐍 Running Python script: ./predict.py
📁 Image path: G:\tensorflow projects\eye-test\backend\uploads\1234567890-eye.jpg
✅ Prediction result: Mild Myopia (-0.5 to -1.5) (Confidence: 87.3%)
```

### Common Issues

| Log Message | Issue | Solution |
|------------|-------|----------|
| `❌ No file in request` | No image uploaded | Check frontend FormData |
| `❌ Python execution error` | Python script failed | Check Python installation |
| `stderr: ModuleNotFoundError` | Missing dependencies | Install Python packages |
| `Error deleting file` | File cleanup failed | Check file permissions |

## Production Checklist

- [ ] Python installed on server
- [ ] All dependencies installed
- [ ] Model file deployed
- [ ] Environment variables configured
- [ ] File upload directory writable
- [ ] Sufficient disk space for uploads
- [ ] Timeout configured appropriately
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] Authentication added

## Support

For issues:
1. Run `node test-python.js` to diagnose
2. Check logs for error messages
3. Verify Python and dependencies installed
4. Test Python script manually
