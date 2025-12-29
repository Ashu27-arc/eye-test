const express = require("express");
const router = express.Router();
const eyeTestController = require("../controllers/eyeTestController");
const upload = require("../middleware/upload");

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/health", eyeTestController.healthCheck);

/**
 * @route   POST /predict
 * @desc    Upload eye image and get AI prediction
 * @access  Public
 */
router.post("/predict", upload.single("eye"), eyeTestController.predictEye);

/**
 * @route   GET /tests
 * @desc    Get all eye test records with pagination
 * @access  Public
 * @query   page, limit, category, sortBy
 */
router.get("/tests", eyeTestController.getAllTests);

/**
 * @route   GET /tests/:id
 * @desc    Get single eye test record by ID
 * @access  Public
 */
router.get("/tests/:id", eyeTestController.getTestById);

/**
 * @route   GET /statistics
 * @desc    Get eye test statistics
 * @access  Public
 */
router.get("/statistics", eyeTestController.getStatistics);

/**
 * @route   DELETE /tests/:id
 * @desc    Delete eye test record
 * @access  Public
 */
router.delete("/tests/:id", eyeTestController.deleteTest);

/**
 * @route   POST /scan-eye
 * @desc    Legacy endpoint for backward compatibility
 * @access  Public
 */
router.post("/scan-eye", upload.single("eye"), eyeTestController.scanEye);

module.exports = router;