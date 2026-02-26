const RolePermission = require('../models/RolePermission');

// Middleware: only allow specific roles
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
};

// Middleware: check permission from the Permission Matrix
const requirePermission = (permission) => async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    // Superadmin always has full access
    if (req.user.role === 'superadmin') return next();

    // Check user-level override first
    const override = req.user.permissionOverrides?.[permission];
    if (override === true) return next();
    if (override === false) return res.status(403).json({ message: 'Permission denied' });

    // Fall back to role-level permission matrix
    const rolePerms = await RolePermission.findOne({
        role: req.user.role,
        organizationId: req.user.organizationId?._id || req.user.organizationId
    });
    if (rolePerms?.permissions?.[permission]) return next();

    return res.status(403).json({ message: 'Permission denied' });
};

module.exports = { requireRole, requirePermission };
