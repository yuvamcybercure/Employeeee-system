const RolePermission = require('../models/RolePermission');
const User = require('../models/User');

// Roles
exports.getRolePermissions = async (req, res) => {
    try {
        const roles = await RolePermission.find({ organizationId: req.user.organizationId });
        res.json({ success: true, roles });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRolePermissions = async (req, res) => {
    try {
        const { role, permissions } = req.body;
        const rp = await RolePermission.findOneAndUpdate(
            { role, organizationId: req.user.organizationId },
            { permissions },
            { upsert: true, new: true }
        );
        res.json({ success: true, rolePermission: rp });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// User Overrides
exports.getUserWithPermissions = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email role permissionOverrides');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUserPermissions = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { permissionOverrides: req.body.permissions },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
