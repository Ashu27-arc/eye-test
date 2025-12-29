const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eye-test';

        const options = {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        };

        const conn = await mongoose.connect(mongoURI, options);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('⚠️ Running without database - data will not be persisted');
        // Don't exit - allow app to run without DB
        return null;
    }
};

/**
 * Check if database is connected
 */
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

module.exports = {
    connectDB,
    isConnected
};