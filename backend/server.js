const express = require("express");
const cors = require("cors");
const config = require("./config/config");
const {
    connectDB
} = require("./config/database");

// Import routes and middleware
const eyeTestRoutes = require("./routes/eyeTestRoutes");
const errorHandler = require("./middleware/errorHandler");

// Initialize Express app
const app = express();

/* =========================
   DATABASE CONNECTION
========================= */
connectDB();

/* =========================
   MIDDLEWARE
========================= */
// Enhanced CORS configuration
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Serve uploaded images statically (optional - for viewing images)
app.use('/uploads', express.static('uploads'));

/* =========================
   ROUTES
========================= */
app.use("/", eyeTestRoutes);

/* =========================
   ERROR HANDLING
========================= */
app.use(errorHandler);

/* =========================
   SERVER START
========================= */
const {
    port,
    host
} = config.server;
const {
    directory: uploadDir
} = config.upload;
const {
    pythonScript,
    modelPath
} = config.ml;

app.listen(port, () => {
    console.log(`✅ Backend running on http://${host}:${port}`);
    console.log(`📁 Upload directory: ${uploadDir}`);
    console.log(`🐍 Python script: ${pythonScript}`);
    console.log(`🤖 Model path: ${modelPath}`);
    console.log(`\n📡 Available endpoints:`);
    console.log(`   POST   /predict       - Upload and predict`);
    console.log(`   GET    /tests         - Get all tests`);
    console.log(`   GET    /tests/:id     - Get test by ID`);
    console.log(`   GET    /statistics    - Get statistics`);
    console.log(`   DELETE /tests/:id     - Delete test`);
    console.log(`   GET    /health        - Health check`);
});