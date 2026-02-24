const RolePermission = require('../models/RolePermission');
const { logActivity } = require('../middleware/logger');

// GET /api/permissions/:role
exports.getPermissions = async (req, res) => {
    try {
        const rolePerms = await RolePermission.findOne({ role: req.params.role, organizationId: req.user.organizationId._id });
        res.json({ success: true, permissions: rolePerms?.permissions || {} });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/permissions/:role
exports.updatePermissions = async (req, res) => {
    try {
        const rolePerms = await RolePermission.findOneAndUpdate(
            { role: req.params.role, organizationId: req.user.organizationId._id },
            { permissions: req.body.permissions },
            { upsert: true, new: true, runValidators: true },
        );
        await logActivity(req.user._id, 'UPDATE_PERMISSIONS', 'permissions', { role: req.params.role, permissions: req.body.permissions }, req);
        res.json({ success: true, rolePerms });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/permissions/all  - Get both admin and employee matrices
exports.getAllPermissions = async (req, res) => {
    try {
        const data = await RolePermission.find({ organizationId: req.user.organizationId._id });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
