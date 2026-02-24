const User = require('../models/User');
const { logActivity } = require('../middleware/logger');

// GET /api/users  (superadmin/admin)
exports.getAllUsers = async (req, res) => {
    try {
        const filter = { organizationId: req.user.organizationId._id };
        // Admins might be restricted to their managed users depending on policy, 
        // but for collaboration, we likely want a broader reach or a specific toggle.
        // For now, let's allow everyone to see organization members if they have access.
        // If we want restriction: if (req.user.role === 'admin' && someCondition) filter.managedBy = req.user._id;
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
        const user = await User.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id }).select(selectFields).populate('managedBy', 'name email');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/users  (superadmin only)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, designation, employeeId, phone, managedBy, leaveEntitlements } = req.body;
        const existing = await User.findOne({ email }); // Email is global for now
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const user = await User.create({
            name, email, password, plainPassword: password, role, department, designation,
            employeeId: employeeId || `EMP${Date.now()}`, phone, managedBy, leaveEntitlements,
            organizationId: req.user.organizationId._id
        });
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
        const isSelf = String(req.user._id) === String(req.params.id);

        if (!isSuperAdmin && !isSelf) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
        }

        let allowedFields = [
            'name', 'phone', 'fatherName', 'gender', 'dob', 'nationality',
            'religion', 'maritalStatus', 'address', 'emergencyContact'
        ];

        if (isSuperAdmin) {
            allowedFields = [
                ...allowedFields,
                'email', 'password', 'department', 'designation', 'isActive',
                'role', 'managedBy', 'permissionOverrides', 'leaveEntitlements'
            ];
        }

        const updates = {};
        allowedFields.forEach(f => {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        });

        // If password is being updated, sync plainPassword
        if (updates.password) {
            updates.plainPassword = updates.password;
        }

        const user = await User.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields manually
        Object.keys(updates).forEach(key => {
            user[key] = updates[key];
        });

        await user.save();

        await logActivity(req.user._id, 'UPDATE_USER_PROFILE', 'users', updates, req, user._id, 'User');
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
            user = await User.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId._id });
            if (user) await logActivity(req.user._id, 'DELETE_USER', 'users', { userId: req.params.id }, req, req.params.id, 'User');
        } else {
            user = await User.findOneAndUpdate({ _id: req.params.id, organizationId: req.user.organizationId._id }, { isActive: false }, { new: true });
            if (user) await logActivity(req.user._id, 'DEACTIVATE_USER', 'users', { userId: req.params.id }, req, user._id, 'User');
        }

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: req.user.role === 'superadmin' ? 'User permanently removed' : 'User deactivated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/users/:id/documents
exports.uploadDocument = async (req, res) => {
    try {
        const { type, name, url, note } = req.body;
        const user = await User.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if a document of this type already exists to increment version
        const existingDocs = user.documents.filter(d => d.type === type);
        const version = existingDocs.length + 1;

        user.documents.push({
            type,
            name,
            url,
            version,
            note,
            uploadedBy: req.user._id,
            uploadedAt: new Date()
        });

        await user.save();
        await logActivity(req.user._id, 'UPLOAD_DOCUMENT', 'users', { type, name, version }, req, user._id, 'User');

        res.status(201).json({ success: true, documents: user.documents });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/users/:id/documents/:docId
exports.deleteDocument = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.documents = user.documents.filter(d => String(d._id) !== String(req.params.docId));
        await user.save();

        res.json({ success: true, documents: user.documents });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/users/:id/photo
exports.updateProfilePhoto = async (req, res) => {
    try {
        const { photo } = req.body;
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId._id },
            { profilePhoto: photo },
            { new: true }
        ).select('-password');

        await logActivity(req.user._id, 'UPDATE_PROFILE_PHOTO', 'users', {}, req, user._id, 'User');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users/birthdays/today
exports.getTodayBirthdays = async (req, res) => {
    try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const birthdays = await User.find({
            organizationId: req.user.organizationId._id,
            isActive: true,
            $expr: {
                $and: [
                    { $eq: [{ $month: '$dob' }, month] },
                    { $eq: [{ $dayOfMonth: '$dob' }, day] }
                ]
            }
        }).select('name email profilePhoto dob designation');

        res.json({ success: true, birthdays });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
