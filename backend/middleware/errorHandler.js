const multer = require("multer");

/**
 * Global error handling middleware
 */
const errorHandler = (error, _req, res, _next) => {
    // Handle Multer errors
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 10MB."
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    // Handle other errors
    console.error("Error:", error);
    res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
    });
};

module.exports = errorHandler;