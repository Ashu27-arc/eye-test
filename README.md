# 👁️ Eye Test Application

AI-powered eye condition detection app with React Native frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Python 3.7+ with TensorFlow, OpenCV, NumPy
- MongoDB (optional, for data persistence)
- Expo Go app (for mobile testing)

### Setup & Run

**1. Backend**
```bash
cd backend
npm install
npm start  # Runs on http://localhost:4000
```

**2. Frontend**
```bash
cd eye
npm install
# Update .env with your IP: EXPO_PUBLIC_API_URL=http://YOUR_IP:4000
npm start  # Scan QR with Expo Go
```

**3. Test**
```bash
# Health check
curl http://localhost:4000/health

# Validate setup
cd backend && npm run check
```

## 📁 Project Structure

```
eye-test/
├── backend/              # Node.js Express API (Port 4000)
│   ├── config/          # Configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Upload & error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── predict.py       # Python ML script
│   └── server.js        # Entry point
├── eye/                 # React Native Expo app
│   ├── app/            # Expo Router pages
│   ├── screens/        # Camera & Result screens
│   └── lib/            # API utilities
└── python-eye/         # ML model training
    ├── model.h5        # Trained TensorFlow model
    └── train.py        # Training script
```

## 🎯 Features

- 📸 **Dual Camera**: Front/back camera toggle
- 🤖 **AI Detection**: TensorFlow model for eye condition prediction
- 📱 **Cross-Platform**: iOS & Android via React Native
- 💾 **Data Persistence**: MongoDB integration
- ⚡ **Real-time**: Instant upload & prediction
- 📊 **Analytics**: Statistics & test history

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/predict` | POST | Upload image & get prediction |
| `/tests` | GET | Get all tests (paginated) |
| `/tests/:id` | GET | Get specific test |
| `/statistics` | GET | Get analytics |
| `/tests/:id` | DELETE | Delete test |

## ⚙️ Configuration

### Backend (.env)
```env
PORT=4000
HOST=localhost
UPLOAD_DIR=./uploads
PYTHON_SCRIPT_PATH=./predict.py
MODEL_PATH=../python-eye/model.h5
MONGODB_URI=mongodb://localhost:27017/eye-test
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:4000
EXPO_PUBLIC_API_TIMEOUT=60000
EXPO_PUBLIC_IMAGE_QUALITY=0.8
```

**Find Your IP:**
- Windows: `ipconfig` (IPv4 Address)
- Mac/Linux: `ifconfig` (inet address)

## 🏗️ System Architecture

```
Mobile App (React Native)
    ↓ HTTP POST /predict
Node.js Backend (Express)
    ↓ exec() child_process
Python ML Engine (TensorFlow)
    ↓ Save results
MongoDB Database
```

## 🧪 Testing

```bash
# Backend health
curl http://localhost:4000/health

# Python connection
cd backend && npm test

# Upload test image
curl -X POST http://localhost:4000/predict -F "eye=@test.jpg"

# View database
mongosh
use eye-test
db.eyetests.find().pretty()
```

## 🐛 Troubleshooting

**Backend won't start**
- Check port 4000: `netstat -ano | findstr :4000`
- Run setup check: `npm run check`

**Python errors**
- Install packages: `pip install tensorflow opencv-python numpy`
- Verify model exists: Check `python-eye/model.h5`

**Mobile can't connect**
- Update IP in `eye/.env`
- Same WiFi network required
- Check firewall settings

**Camera not working**
- Grant camera permissions
- Try toggling front/back
- Restart Expo Go app

## 📊 Database Schema

```javascript
{
  imagePath: "uploads/eye-123.jpg",
  prediction: "Mild Myopia (-0.5 to -1.5) (Confidence: 87.3%)",
  confidence: 87.3,
  category: "Mild Myopia",
  status: "completed",
  createdAt: "2025-12-29T..."
}
```

## 🔧 Development

**Train Model**
```bash
cd python-eye
# Add images to dataset/normal, dataset/mild, etc.
python train.py
```

**View Logs**
- Backend: Console output
- Frontend: Expo DevTools
- MongoDB: MongoDB Compass

## ✅ Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Working |
| Frontend App | ✅ Working |
| Python ML | ✅ Working |
| MongoDB | ✅ Working |
| Image Upload | ✅ Fixed |
| Dual Camera | ✅ Added |

## 📝 Notes

- Model file required at `python-eye/model.h5`
- MongoDB optional (app works without it)
- Use your local IP, not localhost for mobile
- Port 4000 for backend API
- TensorFlow installation may take time

---

**Ready to run!** Start backend, update frontend IP, and scan QR code. 🚀
# eye-test
