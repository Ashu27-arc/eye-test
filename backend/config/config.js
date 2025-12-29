require("dotenv").config();

module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 4000,
        host: process.env.HOST || "localhost",
    },

    // Upload configuration
    upload: {
        directory: process.env.UPLOAD_DIR || "./uploads",
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
        allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    },

    // Python/ML configuration
    ml: {
        pythonScript: process.env.PYTHON_SCRIPT_PATH || "predict.py",
        modelPath: process.env.MODEL_PATH || "../python-eye/model.h5",
    },

    // Python command (auto-detect based on platform)
    pythonCommand: process.platform === 'win32' ? 'python' : 'python3',
};