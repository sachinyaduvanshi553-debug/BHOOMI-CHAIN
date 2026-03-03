// =================================================================
// BhoomiChain – middleware/rbac.js
// Role-Based Access Control (RBAC) Middleware
//
// Usage: router.post('/route', verifyToken, requireRole('registrar'), handler)
//
// Valid roles: citizen | registrar | bank | court
// =================================================================

/**
 * requireRole(...allowedRoles)
 * Returns middleware that checks if req.user.role is in allowedRoles.
 * Call verifyToken BEFORE this middleware so req.user is populated.
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access forbidden. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
            });
        }

        next();
    };
};

module.exports = { requireRole };
