// =================================================================
// BhoomiChain – models/Log.js (Mongoose Schema)
//
// Audit log: records every API action taken by a user.
// Immutable by design – no update or delete methods should be used.
// =================================================================

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userEmail: { type: String, required: true },
        userRole: { type: String, required: true },
        action: {
            type: String,
            required: true,
            // e.g. "RegisterLand:KA-BLR-001", "TransferOwnership:KA-BLR-001"
        },
        landID: { type: String, default: null },
        txID: { type: String, default: null },     // Fabric TxID if applicable
        status: {
            type: String,
            enum: ['success', 'failure'],
            required: true,
        },
        details: { type: String, default: '' },    // extra info / error message
    },
    {
        timestamps: true,
        // Prevent updates to keep audit log tamper-evident
    }
);

// Prevent modification after creation
logSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next(new Error('Audit logs are immutable.'));
    }
    next();
});

module.exports = mongoose.model('Log', logSchema);
