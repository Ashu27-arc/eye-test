/**
 * Setup Validation Script
 * Checks if all required dependencies and files are present
 */

const fs = require('fs');
const path = require('path');
const {
    exec
} = require('child_process');
const config = require('./config/config');

console.log('🔍 Checking Eye-Test Backend Setup...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Node modules
console.log('1️⃣ Checking Node.js dependencies...');
const requiredPackages = ['express', 'cors', 'mongoose', 'multer', 'dotenv'];
const packageJson = require('./package.json');

requiredPackages.forEach(pkg => {
    if (packageJson.dependencies[pkg]) {
        console.log(`   ✅ ${pkg} installed`);
    } else {
        console.log(`   ❌ ${pkg} NOT installed`);
        hasErrors = true;
    }
});

// Check 2: Upload directory
console.log('\n2️⃣ Checking upload directory...');
const uploadDir = path.resolve(config.upload.directory);
if (fs.existsSync(uploadDir)) {
    console.log(`   ✅ Upload directory exists: ${uploadDir}`);
} else {
    console.log(`   ⚠️ Upload directory will be created: ${uploadDir}`);
    hasWarnings = true;
}

// Check 3: Python script
console.log('\n3️⃣ Checking Python script...');
const pythonScript = path.resolve(config.ml.pythonScript);
if (fs.existsSync(pythonScript)) {
    console.log(`   ✅ Python script found: ${pythonScript}`);
} else {
    console.log(`   ❌ Python script NOT found: ${pythonScript}`);
    hasErrors = true;
}

// Check 4: ML Model
console.log('\n4️⃣ Checking ML model...');
const modelPath = path.resolve(config.ml.modelPath);
if (fs.existsSync(modelPath)) {
    console.log(`   ✅ Model file found: ${modelPath}`);
    const stats = fs.statSync(modelPath);
    console.log(`   📊 Model size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} else {
    console.log(`   ❌ Model file NOT found: ${modelPath}`);
    console.log(`   💡 You need to train the model or place it at: ${modelPath}`);
    hasErrors = true;
}

// Check 5: Python installation
console.log('\n5️⃣ Checking Python installation...');
const pythonCmd = config.pythonCommand || 'python';
exec(`${pythonCmd} --version`, (error, stdout, stderr) => {
    if (error) {
        console.log(`   ❌ Python not found (tried: ${pythonCmd})`);
        console.log(`   💡 Install Python 3.7+ from https://www.python.org/`);
        hasErrors = true;
    } else {
        console.log(`   ✅ ${stdout.trim()}`);

        // Check Python packages
        console.log('\n6️⃣ Checking Python packages...');
        exec(`${pythonCmd} -c "import tensorflow, cv2, numpy"`, (error2) => {
            if (error2) {
                console.log('   ❌ Required Python packages missing');
                console.log('   💡 Install with: pip install tensorflow opencv-python numpy');
                hasErrors = true;
            } else {
                console.log('   ✅ TensorFlow installed');
                console.log('   ✅ OpenCV installed');
                console.log('   ✅ NumPy installed');
            }

            printSummary();
        });
    }
});

// Check 6: MongoDB (optional)
console.log('\n7️⃣ Checking MongoDB connection...');
const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eye-test';

mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000
    })
    .then(() => {
        console.log('   ✅ MongoDB connected');
        mongoose.connection.close();
    })
    .catch(() => {
        console.log('   ⚠️ MongoDB not connected (optional - app will work without it)');
        console.log('   💡 Install MongoDB or use MongoDB Atlas for data persistence');
        hasWarnings = true;
    });

function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SETUP SUMMARY');
    console.log('='.repeat(60));

    if (hasErrors) {
        console.log('❌ Setup has ERRORS - please fix them before running the server');
        console.log('\n💡 Common fixes:');
        console.log('   - Run: npm install');
        console.log('   - Install Python 3.7+');
        console.log('   - Run: pip install tensorflow opencv-python numpy');
        console.log('   - Train or obtain the ML model file');
        process.exit(1);
    } else if (hasWarnings) {
        console.log('⚠️ Setup has warnings but should work');
        console.log('✅ You can start the server with: npm start');
    } else {
        console.log('✅ All checks passed! Setup is complete.');
        console.log('🚀 Start the server with: npm start');
    }

    console.log('\n📚 Configuration:');
    console.log(`   Server: http://${config.server.host}:${config.server.port}`);
    console.log(`   Upload Dir: ${uploadDir}`);
    console.log(`   Python: ${pythonCmd}`);
    console.log(`   Model: ${modelPath}`);
    console.log('='.repeat(60) + '\n');
}

// Handle timeout for async checks
setTimeout(() => {
    if (!hasErrors) {
        printSummary();
    }
}, 5000);