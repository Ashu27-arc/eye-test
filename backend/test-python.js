/**
 * Test script to verify Python connection
 * Run: node test-python.js
 */
const {
    exec
} = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

console.log("🧪 Testing Python Connection...\n");

// Check Python installation
console.log("1️⃣ Checking Python installation...");
exec("python --version", (error, stdout, stderr) => {
    if (error) {
        console.error("❌ Python not found!");
        console.error("   Install Python from: https://www.python.org/downloads/");
        return;
    }
    console.log("✅ Python installed:", stdout.trim());
    checkPythonScript();
});

function checkPythonScript() {
    console.log("\n2️⃣ Checking Python script...");
    const scriptPath = process.env.PYTHON_SCRIPT_PATH || "./predict.py";

    if (!fs.existsSync(scriptPath)) {
        console.error(`❌ Python script not found at: ${scriptPath}`);
        return;
    }
    console.log(`✅ Python script found: ${scriptPath}`);
    checkModel();
}

function checkModel() {
    console.log("\n3️⃣ Checking ML model...");
    const modelPath = process.env.MODEL_PATH || "../python-eye/model.h5";

    if (!fs.existsSync(modelPath)) {
        console.error(`❌ Model not found at: ${modelPath}`);
        console.log("   Run: cd ../python-eye && python train.py");
        return;
    }
    console.log(`✅ Model found: ${modelPath}`);
    checkDependencies();
}

function checkDependencies() {
    console.log("\n4️⃣ Checking Python dependencies...");
    exec("python -c \"import tensorflow, cv2, numpy\"", (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Python dependencies missing!");
            console.log("   Install with: pip install tensorflow opencv-python numpy");
            return;
        }
        console.log("✅ All Python dependencies installed");
        testPrediction();
    });
}

function testPrediction() {
    console.log("\n5️⃣ Testing prediction (dry run)...");
    const scriptPath = process.env.PYTHON_SCRIPT_PATH || "./predict.py";
    const modelPath = process.env.MODEL_PATH || "../python-eye/model.h5";

    // Create a dummy test to verify script syntax
    exec(`python -m py_compile ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Python script has syntax errors!");
            console.error(stderr);
            return;
        }
        console.log("✅ Python script syntax is valid");
        console.log("\n🎉 All checks passed! Python is properly connected.");
        console.log("\n📝 Configuration:");
        console.log(`   Script: ${scriptPath}`);
        console.log(`   Model: ${modelPath}`);
        console.log(`   Upload Dir: ${process.env.UPLOAD_DIR || "./uploads"}`);
    });
}