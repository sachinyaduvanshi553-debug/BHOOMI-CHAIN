const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const caManager = require('../fabric/ca');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register user + Enroll in Hyperledger Fabric CA
 */
router.post(
    '/register',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        body('role', 'Role is required').isIn(['citizen', 'registrar', 'bank', 'court']),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password, role } = req.body;

        try {
            let user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: 'User already exists' });

            user = new User({ name, email, password, role });
            await user.save();

            // PRODUCTION UPGRADE: Enroll user in Fabric CA
            try {
                await caManager.registerAndEnrollUser(email);
            } catch (caErr) {
                console.error('Fabric CA Enrollment failed:', caErr);
                // In production, you might want to rollback user creation or mark as 'pending_blockchain'
            }

            const payload = { id: user.id, name: user.name, role: user.role, email: user.email };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email }).select('+password');
            if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

            const isMatch = await user.comparePassword(password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

            const payload = { id: user.id, name: user.name, role: user.role, email: user.email };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 */
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
