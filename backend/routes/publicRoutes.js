const express = require('express');
const gateway = require('../fabric/gateway');
const router = express.Router();

/**
 * @route   GET /api/public/verify/:landID
 * @desc    Public land verification (No auth required)
 */
router.get('/verify/:landID', async (req, res) => {
    try {
        // Use a generic public identity or the system admin to query
        // For the mock/prototype, any identity in the gateway works
        const result = await gateway.evaluateTransaction('admin', 'QueryLand', req.params.landID);
        const land = JSON.parse(result);

        // Return only public non-sensitive data
        res.json({
            success: true,
            data: {
                landID: land.landID,
                geoCoordinates: land.geoCoordinates,
                mortgageStatus: land.mortgageStatus,
                litigationStatus: land.litigationStatus,
                isForSale: land.isForSale,
                askingPrice: land.askingPrice
            }
        });
    } catch (err) {
        res.status(404).json({ message: 'Land record not found in public ledger' });
    }
});

module.exports = router;
