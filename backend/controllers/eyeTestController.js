const {
    exec
} = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config/config");
const EyeTest = require("../models/EyeTest");
const {
    isConnected
} = require("../config/database");

/**
 * Health check endpoint
 */
exports.healthCheck = (_req, res) => {
    res.json({
        status: "ok",
        message: "Eye Test API is running",
        database: isConnected() ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    });
};

/**
 * Predict eye condition from uploaded image
 */
exports.predictEye = async (req, res) => {
    const startTime = Date.now();
    console.log("📸 Received prediction request");

    if (!req.file) {
        console.error("❌ No file in request");
        return res.status(400).json({
            success: false,
            message: "No image file provided"
        });
    }

    console.log("✅ File received:", req.file.filename, req.file.size, "bytes");
    console.log("📁 File details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
    });

    const imagePath = path.join(__dirname, "..", req.file.path);
    const pythonScript = config.ml.pythonScript;
    const modelPath = config.ml.modelPath;

    // Resolve absolute paths
    const absoluteImagePath = path.resolve(imagePath);
    const absolutePythonScript = path.resolve(pythonScript);
    const absoluteModelPath = path.resolve(modelPath);

    console.log("🐍 Running Python script:", absolutePythonScript);
    console.log("📁 Image path:", absoluteImagePath);
    console.log("🤖 Model path:", absoluteModelPath);

    // Use python3 on Unix systems, python on Windows
    const pythonCmd = config.pythonCommand || (process.platform === 'win32' ? 'python' : 'python3');
    const command = `${pythonCmd} "${absolutePythonScript}" "${absoluteImagePath}" "${absoluteModelPath}"`;

    console.log("🔧 Executing command:", command);

    exec(command, async (error, stdout, stderr) => {
        const processingTime = Date.now() - startTime;

        if (error) {
            console.error("❌ Python execution error:", error);
            console.error("stderr:", stderr);

            // Save failed attempt to database
            if (isConnected()) {
                try {
                    await EyeTest.create({
                        imagePath: req.file.path,
                        originalFilename: req.file.originalname,
                        fileSize: req.file.size,
                        mimeType: req.file.mimetype,
                        prediction: "Error",
                        category: "Normal",
                        status: "failed",
                        error: stderr || error.message,
                        processingTime
                    });
                } catch (dbError) {
                    console.error("Database save error:", dbError);
                }
            }

            // Clean up uploaded file
            fs.unlink(imagePath, (unlinkError) => {
                if (unlinkError) console.error("Error deleting file:", unlinkError);
            });

            return res.status(500).json({
                success: false,
                message: "AI processing failed",
                error: stderr || error.message
            });
        }

        try {
            const result = stdout.trim();
            console.log("✅ Prediction result:", result);

            // Extract eye side, category and confidence
            const eyeSide = EyeTest.extractEyeSide(result);
            const category = EyeTest.extractCategory(result);
            const confidence = EyeTest.extractConfidence(result);

            // Save to database
            let savedRecord = null;
            if (isConnected()) {
                try {
                    savedRecord = await EyeTest.create({
                        imagePath: req.file.path,
                        originalFilename: req.file.originalname,
                        fileSize: req.file.size,
                        mimeType: req.file.mimetype,
                        prediction: result,
                        confidence: confidence,
                        category: category,
                        eyeSide: eyeSide,
                        status: "completed",
                        processingTime,
                        deviceInfo: req.headers['user-agent']
                    });
                    console.log("💾 Saved to database with ID:", savedRecord._id);
                } catch (dbError) {
                    console.error("❌ Database save error:", dbError);
                }
            } else {
                console.warn("⚠️ Database not connected - data not saved");
            }

            // Don't delete file immediately - keep for database reference
            // File cleanup can be done by a separate cron job

            return res.json({
                success: true,
                result: result,
                message: "Prediction completed successfully",
                data: savedRecord ? {
                    id: savedRecord._id,
                    category: savedRecord.category,
                    confidence: savedRecord.confidence,
                    eyeSide: savedRecord.eyeSide,
                    timestamp: savedRecord.createdAt
                } : null,
                processingTime: `${processingTime}ms`
            });
        } catch (parseError) {
            console.error("❌ Parse error:", parseError);

            // Clean up uploaded file
            fs.unlink(imagePath, (unlinkError) => {
                if (unlinkError) console.error("Error deleting file:", unlinkError);
            });

            return res.status(500).json({
                success: false,
                message: "Failed to parse prediction result"
            });
        }
    });
};

/**
 * Get all eye test records
 */
exports.getAllTests = async (req, res) => {
    try {
        if (!isConnected()) {
            return res.status(503).json({
                success: false,
                message: "Database not connected"
            });
        }

        const {
            page = 1, limit = 10, category, sortBy = 'createdAt'
        } = req.query;

        const query = {};
        if (category) {
            query.category = category;
        }

        const tests = await EyeTest.find(query)
            .sort({
                [sortBy]: -1
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const count = await EyeTest.countDocuments(query);

        res.json({
            success: true,
            data: tests,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch test records"
        });
    }
};

/**
 * Get single eye test record by ID
 */
exports.getTestById = async (req, res) => {
    try {
        if (!isConnected()) {
            return res.status(503).json({
                success: false,
                message: "Database not connected"
            });
        }

        const test = await EyeTest.findById(req.params.id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test record not found"
            });
        }

        res.json({
            success: true,
            data: test
        });
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch test record"
        });
    }
};

/**
 * Get statistics
 */
exports.getStatistics = async (req, res) => {
    try {
        if (!isConnected()) {
            return res.status(503).json({
                success: false,
                message: "Database not connected"
            });
        }

        const totalTests = await EyeTest.countDocuments();
        const categoryStats = await EyeTest.aggregate([{
            $group: {
                _id: '$category',
                count: {
                    $sum: 1
                },
                avgConfidence: {
                    $avg: '$confidence'
                }
            }
        }]);

        const recentTests = await EyeTest.find()
            .sort({
                createdAt: -1
            })
            .limit(5)
            .select('prediction category confidence createdAt');

        res.json({
            success: true,
            data: {
                totalTests,
                categoryStats,
                recentTests
            }
        });
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics"
        });
    }
};

/**
 * Delete test record
 */
exports.deleteTest = async (req, res) => {
    try {
        if (!isConnected()) {
            return res.status(503).json({
                success: false,
                message: "Database not connected"
            });
        }

        const test = await EyeTest.findById(req.params.id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test record not found"
            });
        }

        // Delete associated image file
        const imagePath = path.join(__dirname, "..", test.imagePath);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log("🗑️ Deleted image file:", imagePath);
        }

        await EyeTest.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Test record deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting test:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete test record"
        });
    }
};

/**
 * Legacy scan-eye endpoint for backward compatibility
 */
exports.scanEye = async (req, res) => {
    console.log("📸 Received legacy scan request");

    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: "No image file provided"
        });
    }

    const imagePath = path.join(__dirname, "..", req.file.path);
    const pythonScript = config.ml.pythonScript;
    const modelPath = config.ml.modelPath;

    // Use python3 on Unix systems, python on Windows
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const command = `${pythonCmd} "${pythonScript}" "${imagePath}" "${modelPath}"`;

    exec(command, (error, stdout) => {
        // Clean up uploaded file
        fs.unlink(imagePath, (unlinkError) => {
            if (unlinkError) console.error("Error deleting file:", unlinkError);
        });

        if (error) {
            return res.status(500).json({
                success: false,
                error: "AI processing failed"
            });
        }

        return res.json({
            success: true,
            result: stdout.trim()
        });
    });
};