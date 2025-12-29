# Database Setup Guide

## MongoDB Installation

### Option 1: Local MongoDB (Recommended for Development)

#### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. MongoDB Compass will be installed automatically (GUI tool)

#### Verify Installation
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (if not running as service)
mongod
```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (free tier available)
4. Create database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get connection string

**Update .env with Atlas connection string:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eye-test?retryWrites=true&w=majority
```

## Database Configuration

### Environment Variables

Update `backend/.env`:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/eye-test

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eye-test
```

## Database Schema

### EyeTest Collection

```javascript
{
  _id: ObjectId,
  
  // Image Information
  imagePath: String,           // Path to uploaded image
  imageUrl: String,            // Public URL (optional)
  originalFilename: String,    // Original file name
  fileSize: Number,            // File size in bytes
  mimeType: String,            // image/jpeg, image/png
  
  // Prediction Results
  prediction: String,          // Full prediction text
  confidence: Number,          // Confidence percentage (0-100)
  category: String,            // Normal, Mild Myopia, etc.
  
  // User Information (optional)
  userId: String,              // For future user tracking
  deviceInfo: String,          // User agent
  
  // Metadata
  processingTime: Number,      // Processing time in ms
  status: String,              // pending, completed, failed
  error: String,               // Error message if failed
  
  // Timestamps (auto-generated)
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Predict (with DB save)
```http
POST /predict
Content-Type: multipart/form-data

Body:
- eye: image file

Response:
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

### 2. Get All Tests
```http
GET /tests?page=1&limit=10&category=Normal&sortBy=createdAt

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

### 3. Get Test by ID
```http
GET /tests/:id

Response:
{
  "success": true,
  "data": { ... }
}
```

### 4. Get Statistics
```http
GET /statistics

Response:
{
  "success": true,
  "data": {
    "totalTests": 150,
    "categoryStats": [
      { "_id": "Normal", "count": 80, "avgConfidence": 92.5 },
      { "_id": "Mild Myopia", "count": 50, "avgConfidence": 85.3 }
    ],
    "recentTests": [...]
  }
}
```

### 5. Delete Test
```http
DELETE /tests/:id

Response:
{
  "success": true,
  "message": "Test record deleted successfully"
}
```

## Testing Database Connection

### 1. Check Health Endpoint
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Eye Test API is running",
  "database": "connected",
  "timestamp": "2025-12-29T..."
}
```

### 2. View Database in MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `eye-test` database
4. View `eyetests` collection

### 3. Query Database via CLI

```bash
# Connect to MongoDB
mongosh

# Switch to eye-test database
use eye-test

# View all records
db.eyetests.find().pretty()

# Count records
db.eyetests.countDocuments()

# Find by category
db.eyetests.find({ category: "Normal" })

# Get statistics
db.eyetests.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

## Running Without Database

The application will work without MongoDB:
- Predictions will still work
- Data won't be saved
- Health endpoint will show: `"database": "disconnected"`

## Troubleshooting

### Connection Failed

**Error**: `MongoDB connection failed`

**Solutions**:
1. Check if MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # Check status
   mongod --version
   ```

2. Verify connection string in `.env`
3. Check firewall settings
4. For Atlas: Verify IP whitelist

### Authentication Failed

**Error**: `Authentication failed`

**Solutions**:
1. Check username/password in connection string
2. Verify user has correct permissions
3. For Atlas: Check database user credentials

### Database Not Created

MongoDB creates databases automatically on first write operation. Just start using the API and the database will be created.

## Production Considerations

1. **Security**:
   - Use strong passwords
   - Enable authentication
   - Use SSL/TLS connections
   - Whitelist specific IPs

2. **Performance**:
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Monitor query performance

3. **Backup**:
   - Set up automated backups
   - Test restore procedures
   - Use MongoDB Atlas for automatic backups

4. **Monitoring**:
   - Monitor connection pool
   - Track query performance
   - Set up alerts for failures

## Data Retention

Consider implementing data cleanup:

```javascript
// Delete old records (example: older than 30 days)
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await EyeTest.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
```

## Useful MongoDB Commands

```bash
# Backup database
mongodump --db eye-test --out ./backup

# Restore database
mongorestore --db eye-test ./backup/eye-test

# Export to JSON
mongoexport --db eye-test --collection eyetests --out eyetests.json

# Import from JSON
mongoimport --db eye-test --collection eyetests --file eyetests.json
```
