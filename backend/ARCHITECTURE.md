# Backend Architecture

## MVC Structure

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT REQUEST                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      server.js                           │
│  • Express app initialization                            │
│  • Middleware setup (CORS, JSON, URL-encoded)           │
│  • Route mounting                                        │
│  • Error handler mounting                                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   routes/eyeTestRoutes.js                │
│  • GET  /health                                          │
│  • POST /predict                                         │
│  • POST /scan-eye                                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 middleware/upload.js                     │
│  • Multer configuration                                  │
│  • File validation (type, size)                          │
│  • Storage configuration                                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            controllers/eyeTestController.js              │
│  • healthCheck()    - Server status                      │
│  • predictEye()     - AI prediction logic                │
│  • scanEye()        - Legacy endpoint                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Python ML Model                       │
│  • predict.py                                            │
│  • model.h5                                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   middleware/errorHandler.js             │
│  • Multer error handling                                 │
│  • Global error handling                                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      CLIENT RESPONSE                     │
└─────────────────────────────────────────────────────────┘
```

## Configuration Flow

```
config/config.js
    │
    ├─► server.js (port, host)
    ├─► middleware/upload.js (upload settings)
    └─► controllers/eyeTestController.js (ML paths)
```

## Request Flow Example

### POST /predict

1. **Client** sends multipart/form-data with image
2. **server.js** receives request, applies middleware
3. **routes/eyeTestRoutes.js** matches route
4. **middleware/upload.js** validates and saves file
5. **controllers/eyeTestController.js** processes:
   - Validates file exists
   - Calls Python script with image path
   - Waits for ML prediction
   - Cleans up uploaded file
   - Returns result
6. **middleware/errorHandler.js** catches any errors
7. **Client** receives JSON response

## File Responsibilities

| File | Responsibility |
|------|---------------|
| `server.js` | App initialization, middleware setup |
| `config/config.js` | Centralized configuration |
| `routes/eyeTestRoutes.js` | Route definitions |
| `controllers/eyeTestController.js` | Business logic |
| `middleware/upload.js` | File upload handling |
| `middleware/errorHandler.js` | Error handling |

## Benefits of This Structure

✅ **Separation of Concerns**: Each file has a single responsibility
✅ **Maintainability**: Easy to locate and modify specific functionality
✅ **Scalability**: Simple to add new routes/controllers
✅ **Testability**: Controllers can be unit tested independently
✅ **Reusability**: Middleware can be reused across routes
✅ **Clean Code**: server.js is minimal and readable
