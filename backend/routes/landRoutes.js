const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const gateway = require('../fabric/gateway');
const ipfs = require('../config/ipfs');
const Application = require('../models/Application');
const Log = require('../models/Log');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

/**
 * @route   GET /api/land/all
 * @desc    Get all land parcels (Filtered by owner for Citizens)
 */
router.get('/all', verifyToken, async (req, res) => {
    try {
        const result = await gateway.evaluateTransaction(req.user.email, 'QueryAllLands');
        let allLands = JSON.parse(result);

        // For this prototype, we'll fetch full details for each to get ownership info
        // In production, we'd use a more efficient rich query or indexer
        const detailedLands = await Promise.all(allLands.map(async (l) => {
            try {
                const detail = await gateway.evaluateTransaction(req.user.email, 'QueryLand', l.landID);
                return JSON.parse(detail);
            } catch (e) {
                return l;
            }
        }));

        // Filter for the current user if they are a citizen
        const filtered = req.user.role === 'citizen'
            ? detailedLands.filter(l => l.currentOwner === req.user.email)
            : detailedLands;

        res.json(filtered);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch land assets' });
    }
});

// Multer config for file uploads
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   POST /api/land/register-land
 * @desc    Register a new land parcel (Real IPFS + Real Personal Identity)
 * @access  Private (Registrar Only)
 */
router.post(
    '/register-land',
    verifyToken,
    requireRole(['registrar']),
    upload.single('document'),
    [
        body('landID', 'Land ID is required').not().isEmpty(),
        body('owner', 'Owner email is required').isEmail(),
        body('geoCoordinates', 'Geo-coordinates are required').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { landID, owner, geoCoordinates } = req.body;
        const userEmail = req.user.email; // Who is performing the transaction (Registrar)

        try {
            let documentHash = 'QmDemoNoFile';

            // PRODUCTION UPGRADE: Upload real file to IPFS
            if (req.file) {
                documentHash = await ipfs.uploadFile(req.file.buffer);
            }

            // Submit to Blockchain using the Registrar's own identity from the wallet
            const result = await gateway.submitTransaction(
                userEmail,
                'RegisterLand',
                landID,
                owner,
                geoCoordinates,
                documentHash
            );

            // Save to Audit Log
            await Log.create({
                userID: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                action: 'REGISTER_LAND',
                landID: landID,
                status: 'success',
                details: `Land ${landID} registered to ${owner}. IPFS: ${documentHash}`,
                txID: JSON.parse(result).txID || 'local_tx_fail'
            });

            res.status(201).json({ success: true, message: 'Land registered on Ledger!', data: JSON.parse(result), ipfsCID: documentHash });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Blockchain/IPFS Error', error: err.message });
        }
    }
);

/**
 * @route   POST /api/land/transfer-land
 * @desc    Transfer land ownership
 */
router.post(
    '/transfer-land',
    verifyToken,
    requireRole(['citizen']),
    async (req, res) => {
        const { landID, newOwner } = req.body;
        const userEmail = req.user.email; // The Citizen (Current Owner)

        try {
            const result = await gateway.submitTransaction(userEmail, 'TransferOwnership', landID, newOwner);

            await Log.create({
                userID: req.user.id,
                userEmail: req.user.email,
                userRole: req.user.role,
                action: 'TRANSFER_LAND',
                landID: landID,
                status: 'success',
                details: `Transferred ${landID} to ${newOwner}`,
                txID: JSON.parse(result).txID
            });

            res.json({ success: true, message: 'Ownership transferred on Ledger!', data: JSON.parse(result) });
        } catch (err) {
            res.status(500).json({ message: 'Blockchain Error', error: err.message });
        }
    }
);

/**
 * @route   POST /api/land/add-mortgage
 * @desc    Add lien/mortgage to land
 */
router.post('/add-mortgage', verifyToken, requireRole(['bank']), async (req, res) => {
    try {
        const result = await gateway.submitTransaction(req.user.email, 'AddMortgage', req.body.landID);
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(500).json({ message: 'Blockchain Error', error: err.message });
    }
});

/**
 * @route   POST /api/land/remove-mortgage
 * @desc    Clear lien/mortgage
 */
router.post('/remove-mortgage', verifyToken, requireRole(['bank']), async (req, res) => {
    try {
        const result = await gateway.submitTransaction(req.user.email, 'RemoveMortgage', req.body.landID);
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(500).json({ message: 'Blockchain Error', error: err.message });
    }
});

/**
 * @route   POST /api/land/mark-litigation
 * @desc    Set litigation status
 */
router.post('/mark-litigation', verifyToken, requireRole(['court']), async (req, res) => {
    try {
        const result = await gateway.submitTransaction(req.user.email, 'MarkLitigation', req.body.landID);
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(500).json({ message: 'Blockchain Error', error: err.message });
    }
});

/**
 * @route   POST /api/land/clear-litigation
 * @desc    Clear litigation status
 */
router.post('/clear-litigation', verifyToken, requireRole(['court']), async (req, res) => {
    try {
        const result = await gateway.submitTransaction(req.user.email, 'ClearLitigation', req.body.landID);
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(500).json({ message: 'Blockchain Error', error: err.message });
    }
});

/**
 * Access individual land details from Ledger
 */
router.get('/:landID', verifyToken, async (req, res) => {
    try {
        const result = await gateway.evaluateTransaction(req.user.email, 'QueryLand', req.params.landID);
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(404).json({ message: 'Land parcel not found' });
    }
});

/**
 * Access land history from Ledger
 */
router.get('/:landID/history', verifyToken, async (req, res) => {
    try {
        const result = await gateway.evaluateTransaction(req.user.email, 'QueryLandHistory', req.params.landID);
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(404).json({ message: 'History not found' });
    }
});

/**
 * Marketplace: List land for sale
 */
router.post('/list-for-sale', verifyToken, requireRole(['citizen']), async (req, res) => {
    const { landID, price } = req.body;
    try {
        const result = await gateway.submitTransaction(req.user.email, 'ListLandForSale', landID, price);
        await Log.create({
            userID: req.user.id,
            userEmail: req.user.email,
            userRole: req.user.role,
            action: 'LIST_FOR_SALE',
            landID: landID,
            status: 'success',
            details: `Listed land ${landID} for sale at ₹${price}`,
            txID: JSON.parse(result).txID
        });
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(500).json({ message: 'Blockchain Error', error: err.message });
    }
});

/**
 * Marketplace: Execute Purchase
 */
router.post('/buy-land', verifyToken, requireRole(['citizen']), async (req, res) => {
    const { landID } = req.body;
    try {
        const result = await gateway.submitTransaction(req.user.email, 'ExecutePurchase', landID, req.user.email);
        await Log.create({
            userID: req.user.id,
            userEmail: req.user.email,
            userRole: req.user.role,
            action: 'BUY_LAND',
            landID: landID,
            status: 'success',
            details: `Purchased land ${landID}`,
            txID: JSON.parse(result).txID
        });
        res.json({ success: true, data: JSON.parse(result) });
    } catch (err) {
        res.status(500).json({ message: 'Blockchain Error', error: err.message });
    }
});

/**
 * Fetch all lands currently in the marketplace
 */
router.get('/marketplace/all', verifyToken, async (req, res) => {
    try {
        // Optimization: In a real app, this would be a CouchDB rich query
        // For now, we fetch all and filter or use a specific chaincode query
        const result = await gateway.evaluateTransaction(req.user.email, 'QueryAllLands'); // Assuming QueryAllLands exists or we add it
        const allLands = JSON.parse(result);
        const forSale = allLands.filter(l => l.isForSale);
        res.json({ success: true, data: forSale });
    } catch (err) {
        res.status(500).json({ message: 'Marketplace fetch failed' });
    }
});

/**
 * IPFS Document Retrieval
 */
router.get('/document/:cid', verifyToken, async (req, res) => {
    try {
        const buffer = await ipfs.getFile(req.params.cid);
        res.set('Content-Type', 'application/pdf'); // Defaulting to PDF
        res.send(buffer);
    } catch (err) {
        res.status(404).send('Document not found on IPFS');
    }
});

module.exports = router;
