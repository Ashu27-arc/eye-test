const mongoose = require('mongoose');

const eyeTestSchema = new mongoose.Schema({
    // Image information
    imagePath: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    originalFilename: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },

    // Prediction results
    prediction: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        enum: ['Normal', 'Mild Myopia', 'Moderate Myopia', 'Severe Myopia'],
        required: true
    },

    // User information (optional - for future use)
    userId: {
        type: String,
        default: null
    },
    deviceInfo: {
        type: String,
        default: null
    },

    // Metadata
    processingTime: {
        type: Number, // in milliseconds
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    error: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
eyeTestSchema.index({
    createdAt: -1
});
eyeTestSchema.index({
    category: 1
});
eyeTestSchema.index({
    userId: 1
});

// Virtual for formatted date
eyeTestSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Method to extract category from prediction string
eyeTestSchema.statics.extractCategory = function(predictionString) {
    if (predictionString.includes('Normal')) return 'Normal';
    if (predictionString.includes('Mild Myopia')) return 'Mild Myopia';
    if (predictionString.includes('Moderate Myopia')) return 'Moderate Myopia';
    if (predictionString.includes('Severe Myopia')) return 'Severe Myopia';
    return 'Normal';
};

// Method to extract confidence from prediction string
eyeTestSchema.statics.extractConfidence = function(predictionString) {
    const match = predictionString.match(/Confidence:\s*([\d.]+)%/);
    return match ? parseFloat(match[1]) : null;
};

module.exports = mongoose.model('EyeTest', eyeTestSchema);