# Eye Test Backend API

Node.js Express backend for AI-powered eye condition detection with MongoDB database integration.

## 🚀 Features

- ✅ **AI Prediction**: TensorFlow model integration for eye condition detection
- ✅ **Database Storage**: MongoDB integration for storing test results
- ✅ **Image Upload**: Multer-based file upload with validation
- ✅ **RESTful API**: Complete CRUD operations
- ✅ **Statistics**: Analytics and reporting endpoints
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **MVC Architecture**: Clean code structure

## 📁 Project Structure

```
backend/
├── config/
│   ├── config.js              # Central configuration
│   └── database.js            # MongoDB connection
├── controllers/
│   └── eyeTestController.js   # Business logic
├── middleware/
│   ├── upload.js              # File upload handling
│   └── errorHandler.js        # Error handling
├── models/
│   └── EyeTest.js             # MongoDB schema
├── routes/
│   └── eyeTestRoutes.js       # API routes
├── uploads/                   # Uploaded images
├── .env                       # Environment variables
├── server.js                  # Entry point
├── predict.py                 # Python ML script
└── test-python.js             # Connection test
```

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install MongoDB

**Option A: Local MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Install and run as service

**Option B: MongoDB Atlas (Cloud)**
- Sign up at: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string

### 3. Configure Environment

Create `.env` file:

```env
# Server
PORT=4000
HOST=localhost

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Python/ML
PYTHON_SCRIPT_PATH=./predict.py
MODEL_PATH=../python-eye/model.h5

# Database
MONGODB_URI=mongodb://localhost:27017/eye-test
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eye-test
```

### 4. Install Python Dependencies

```bash
pip install tensorflow opencv-python numpy
```

## 🎯 API Endpoints

### Health Check
```http
GET /health
```
Returns server and database status.

### Predict Eye Condition
```http
POST /predict
Content-Type: multipart/form-data

Body:
- eye: image file (JPEG/PNG, max 10MB)
```

**Response:**
```json
{
  "success": true,
  "result": "Mild Myopia (-0.5 to -1.5) (Confidence: 87.3%)",
  "message": "Prediction completed successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "category": "Mild Myopia",
    "confidence": 87.3,
    "timestamp": "2025-12-29T..."
  },
  "processingTime": "1234ms"
}
```

### Get All Tests
```http
GET /tests?page=1&limit=10&category=Normal&sortBy=createdAt
```

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page
- `category`: Filter by category
- `sortBy` (default: createdAt): Sort field

### Get Test by ID
```http
GET /tests/:id
```

### Get Statistics
```http
GET /statistics
```

Returns:
- Total tests count
- Category distribution
- Average confidence per category
- Recent tests

### Delete Test
```http
DELETE /tests/:id
```

Deletes test record and associated image file.

## 🧪 Testing

### Test Python Connection
```bash
npm test
# or
node test-python.js
```

### Test API
```bash
# Start server
npm start

# Test health endpoint
curl http://localhost:4000/health

# Test prediction (with image file)
curl -X POST http://localhost:4000/predict \
  -F "eye=@path/to/image.jpg"
```

## 🗄️ Database Schema

```javascript
{
  _id: ObjectId,
  imagePath: String,
  originalFilename: String,
  fileSize: Number,
  mimeType: String,
  prediction: String,
  confidence: Number,
  category: String,  // Normal, Mild Myopia, Moderate Myopia, Severe Myopia
  userId: String,
  deviceInfo: String,
  processingTime: Number,
  status: String,    // pending, completed, failed
  error: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 📊 Database Management

### View Data in MongoDB Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `eye-test` database
4. View `eyetests` collection

### Query via CLI
```bash
mongosh
use eye-test
db.eyetests.find().pretty()
db.eyetests.countDocuments()
```

## 🚀 Running the Server

### Development
```bash
npm start
```

### With Auto-reload (if nodemon installed)
```bash
npm run dev
```

### Production
```bash
NODE_ENV=production npm start
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `HOST` | Server host | localhost |
| `UPLOAD_DIR` | Upload directory | ./uploads |
| `MAX_FILE_SIZE` | Max file size (bytes) | 10485760 (10MB) |
| `PYTHON_SCRIPT_PATH` | Python script path | ./predict.py |
| `MODEL_PATH` | ML model path | ../python-eye/model.h5 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/eye-test |

## 🔍 Logging

The server logs:
- 📸 Incoming requests
- ✅ Successful operations
- ❌ Errors and failures
- 💾 Database operations
- 🐍 Python script execution

## 🛡️ Error Handling

Common errors:
- **400**: Bad request (no file, invalid type)
- **404**: Resource not found
- **413**: File too large
- **500**: Server error (AI processing failed)
- **503**: Database not connected

## 🔒 Security Considerations

- File type validation (JPEG/PNG only)
- File size limits (10MB max)
- Automatic file cleanup
- Path sanitization
- CORS enabled (configure for production)

## 📚 Documentation

- `DATABASE_SETUP.md` - Database setup guide
- `PYTHON_INTEGRATION.md` - Python integration guide
- `ARCHITECTURE.md` - System architecture

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service (Windows)
net start MongoDB
```

### Python Script Error
```bash
# Test Python connection
npm test

# Check Python installation
python --version

# Install dependencies
pip install tensorflow opencv-python numpy
```

### Image Upload Failed
- Check upload directory exists and is writable
- Verify file type is JPEG/PNG
- Check file size is under 10MB
- Review server logs for details

## 📦 Dependencies

```json
{
  "express": "^5.2.1",
  "mongoose": "^8.x",
  "multer": "^2.0.2",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3"
}
```

## 🎯 Next Steps

- [ ] Add user authentication
- [ ] Implement rate limiting
- [ ] Add image compression
- [ ] Set up automated backups
- [ ] Add API documentation (Swagger)
- [ ] Implement caching
- [ ] Add monitoring/analytics

## 📞 Support

For issues:
1. Check logs for error messages
2. Run `npm test` to verify Python connection
3. Check MongoDB connection with `/health` endpoint
4. Review documentation files

## 📄 License

ISC
