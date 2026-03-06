// =================================================================
// BhoomiChain – database/seed.js
// Seeds MongoDB with demo users (one per role).
// Run: node database/seed.js  (from project root)
// Requires MONGODB_URI in environment or uses localhost default.
// =================================================================

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bhoomichain';

// User schema inline (lightweight seed script doesn't need full model)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const DEMO_USERS = [
    { name: 'Ramesh Kumar', email: 'ramesh@bhoomichain.in', role: 'citizen', password: 'Citizen@1234' },
    { name: 'Anita Singh', email: 'anita@bhoomichain.in', role: 'registrar', password: 'Registrar@1234' },
    { name: 'SBI Bank Auth', email: 'bank@bhoomichain.in', role: 'bank', password: 'Bank@1234' },
    { name: 'District Court', email: 'court@bhoomichain.in', role: 'court', password: 'Court@1234' },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB:', MONGODB_URI);

        // Clear existing demo users
        await User.deleteMany({ email: { $in: DEMO_USERS.map(u => u.email) } });
        console.log('🗑️  Cleared existing demo users.');

        // Hash passwords and insert
        const saltRounds = 12;
        const users = await Promise.all(
            DEMO_USERS.map(async (u) => ({
                ...u,
                password: await bcrypt.hash(u.password, saltRounds),
            }))
        );

        await User.insertMany(users);

        console.log('\n✅ Demo users seeded:');
        DEMO_USERS.forEach(u =>
            console.log(`   ${u.role.padEnd(12)} | ${u.email.padEnd(30)} | Password: ${u.password}`)
        );

        console.log('\n🎉 Seeding complete! You can now login with the above credentials.');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB.');
    }
}

seed();
