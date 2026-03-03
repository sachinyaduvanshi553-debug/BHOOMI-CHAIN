const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * BhoomiChain System Reset Utility
 * Clears MongoDB collections and deletes user wallet identities.
 */
async function resetSystem() {
    console.log('=================================================================');
    console.log('  BhoomiChain System Reset Utility');
    console.log('=================================================================');

    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bhoomichain');
        console.log('>>> Connected to MongoDB');

        // 2. Clear Collections
        const collections = ['users', 'applications', 'logs'];
        for (const colName of collections) {
            const collection = mongoose.connection.collection(colName);
            if (collection) {
                await collection.deleteMany({});
                console.log(`    - Cleared collection: ${colName}`);
            }
        }

        // 3. Clear Wallet Directory
        const walletPath = path.join(__dirname, '../wallet');
        if (fs.existsSync(walletPath)) {
            const files = fs.readdirSync(walletPath);
            for (const file of files) {
                const filePath = path.join(walletPath, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
            }
            console.log('>>> Cleared Fabric Wallet identities');
        }

        console.log('=================================================================');
        console.log('  Reset Complete! System is now in a fresh state.');
        console.log('=================================================================');

    } catch (error) {
        console.error('!!! Reset Failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

resetSystem();
