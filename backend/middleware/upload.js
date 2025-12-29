const multer = require("multer");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");

// Create uploads directory if it doesn't exist
const uploadDir = config.upload.directory;
const absoluteUploadDir = path.resolve(uploadDir);

if (!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, {
        recursive: true
    });
    console.log(`📁 Created upload directory: ${absoluteUploadDir}`);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        console.log(`📂 Upload destination: ${absoluteUploadDir}`);
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `eye-${uniqueSuffix}${ext}`;
        console.log(`📝 Generated filename: ${filename}`);
        cb(null, filename);
    }
});

// File filter function
const fileFilter = (_req, file, cb) => {
    console.log(`🔍 Checking file: ${file.originalname}, type: ${file.mimetype}`);

    if (config.upload.allowedTypes.includes(file.mimetype)) {
        console.log(`✅ File type accepted: ${file.mimetype}`);
        cb(null, true);
    } else {
        console.log(`❌ File type rejected: ${file.mimetype}`);
        cb(new Error(`Invalid file type. Only ${config.upload.allowedTypes.join(', ')} are allowed.`), false);
    }
};

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.upload.maxFileSize
    },
    fileFilter: fileFilter
});

// Log upload configuration
console.log(`📤 Upload Configuration:`);
console.log(`   Directory: ${absoluteUploadDir}`);
console.log(`   Max Size: ${(config.upload.maxFileSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Allowed Types: ${config.upload.allowedTypes.join(', ')}`);

module.exports = upload;