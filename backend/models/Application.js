// =================================================================
// BhoomiChain – models/Application.js (Mongoose Schema)
//
// Tracks land transfer applications submitted by citizens.
// Blockchain TxID stored here after the Fabric transaction succeeds.
// MongoDB is auxiliary storage; blockchain is the source of truth.
// =================================================================

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        landID: {
            type: String,
            required: [true, 'Land ID is required'],
            trim: true,
        },
        seller: {
            type: String,
            required: [true, 'Seller (current owner) email/ID is required'],
            trim: true,
        },
        buyer: {
            type: String,
            required: [true, 'Buyer (new owner) email/ID is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        // Hyperledger Fabric transaction ID – written after successful commit
        txID: {
            type: String,
            default: null,
        },
        actionType: {
            type: String,
            enum: [
                'register',
                'transfer',
                'add-mortgage',
                'remove-mortgage',
                'mark-litigation',
                'clear-litigation',
            ],
            required: true,
        },
        submittedBy: {
            // Reference to the User who initiated this application
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Application', applicationSchema);
