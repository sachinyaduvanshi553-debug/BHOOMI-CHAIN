// =================================================================
// BhoomiChain – models/User.js (Mongoose Schema)
// 
// Stores user authentication data.
// NOTE: MongoDB is NOT the source of truth for land ownership.
//       Blockchain is. This collection only handles auth + profile.
// =================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['citizen', 'registrar', 'bank', 'court'];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,   // never returned in queries by default
        },
        role: {
            type: String,
            enum: { values: ROLES, message: 'Invalid role. Allowed: citizen, registrar, bank, court' },
            default: 'citizen',
        },
    },
    {
        timestamps: true,  // adds createdAt, updatedAt
    }
);

// ---- Pre-save hook: hash password with bcrypt ----------------
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ---- Instance method: compare password ----------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
