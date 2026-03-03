// =================================================================
// BhoomiChain – config/db.js
// Connects to MongoDB using Mongoose.
// =================================================================

const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bhoomichain';

    try {
        await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${uri}`);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        throw err;
    }
};

module.exports = connectDB;
