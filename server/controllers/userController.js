const User = require('../models/User');
const { logActivity } = require('../middleware/logger');

// GET /api/users  (superadmin/admin)
exports.getAllUsers = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'admin') {
            filter.managedBy = req.user._id;
        }
        const selectFields = ['superadmin', 'admin'].includes(req.user.role) ? '' : '-password -plainPassword';
        const users = await User.find(filter).select(selectFields).populate('managedBy', 'name email');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const selectFields = ['superadmin', 'admin'].includes(req.user.role) ? '' : '-password -plainPassword';
        const user = await User.findById(req.params.id).select(selectFields).populate('managedBy', 'name email');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/users  (superadmin only)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, designation, employeeId, phone, managedBy } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const user = await User.create({ name, email, password, plainPassword: password, role, department, designation, employeeId: employeeId || `EMP${Date.now()}`, phone, managedBy });
        await logActivity(req.user._id, 'CREATE_USER', 'users', { name, email, role }, req, user._id, 'User');
        res.status(201).json({ success: true, user: user.toSafeJSON() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const isSuperAdmin = req.user.role === 'superadmin';
        const allowedFields = ['name', 'department', 'designation', 'phone', 'isActive', 'role', 'managedBy', 'permissionOverrides'];

        if (isSuperAdmin) {
            allowedFields.push('email', 'password');
        }

        const updates = {};
        allowedFields.forEach(f => {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        });

        // If password is being updated, sync plainPassword
        if (updates.password) {
            updates.plainPassword = updates.password;
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields manually to trigger pre-save middlewares if password changed
        Object.keys(updates).forEach(key => {
            user[key] = updates[key];
        });

        await user.save();

        await logActivity(req.user._id, 'UPDATE_USER', 'users', updates, req, user._id, 'User');
        res.json({ success: true, user: user.toSafeJSON() });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/users/:id  (superadmin can hard delete, admin soft deletes)
exports.deleteUser = async (req, res) => {
    try {
        let user;
        if (req.user.role === 'superadmin') {
            user = await User.findByIdAndDelete(req.params.id);
            if (user) await logActivity(req.user._id, 'DELETE_USER', 'users', { userId: req.params.id }, req, req.params.id, 'User');
        } else {
            user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
            if (user) await logActivity(req.user._id, 'DEACTIVATE_USER', 'users', { userId: req.params.id }, req, user._id, 'User');
        }

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: req.user.role === 'superadmin' ? 'User permanently removed' : 'User deactivated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/users/:id/photo
exports.updateProfilePhoto = async (req, res) => {
    try {
        const { photo } = req.body; // Cloudinary URL after upload
        const user = await User.findByIdAndUpdate(req.params.id, { profilePhoto: photo }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
