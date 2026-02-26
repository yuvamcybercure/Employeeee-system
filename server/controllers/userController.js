const User = require('../models/User');
const { logActivity } = require('../middleware/logger');

const { uploadBase64 } = require('../config/cloudinary');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('organizationId', 'name logo');
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = ['phone', 'address', 'fatherName', 'gender', 'dob', 'nationality', 'religion', 'maritalStatus', 'emergencyContact'];
        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

        // Handle profile photo from either upload or base64
        if (req.file) {
            const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
            updates.profilePhoto = `${baseUrl}/public/uploads/profiles/${req.file.filename}`;
        } else if (req.body.profilePhoto && req.body.profilePhoto.startsWith('data:image')) {
            const result = await uploadBase64(req.body.profilePhoto, 'profiles');
            updates.profilePhoto = result.url;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/users/bank-details
exports.updateBankDetails = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { bankDetails: req.body }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users  (superadmin/admin/master-admin)
exports.getAllUsers = async (req, res) => {
    try {
        let filter = { organizationId: req.user.organizationId?._id || req.user.organizationId };

        // Master admin can see any organization's users if requested via query
        if (req.user.role === 'master-admin' && req.query.organizationId) {
            filter.organizationId = req.query.organizationId;
        }

        const selectFields = ['superadmin', 'admin', 'master-admin'].includes(req.user.role) ? '-password' : '-password';
        const users = await User.find(filter).select(selectFields).populate('managedBy', 'name email');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const query = { _id: req.params.id };
        if (req.user.role !== 'master-admin') query.organizationId = orgId;

        const selectFields = '-password';
        const user = await User.findOne(query).select(selectFields).populate('managedBy', 'name email');
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
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const user = await User.create({
            name, email, password, role, department, designation,
            employeeId: employeeId || `EMP${Date.now()}`, phone, managedBy, leaveEntitlements,
            organizationId: orgId
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
        const isSuperAdmin = req.user.role === 'superadmin' || req.user.role === 'master-admin';
        const isAdmin = req.user.role === 'admin';
        const isSelf = String(req.user._id) === String(req.params.id);

        if (!isSuperAdmin && !isAdmin && !isSelf) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
        }

        let allowedFields = [
            'name', 'phone', 'fatherName', 'gender', 'dob', 'nationality',
            'religion', 'maritalStatus', 'address', 'emergencyContact'
        ];

        if (isSuperAdmin || isAdmin) {
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

        // SECURITY: plainPassword sync removed — passwords are bcrypt-hashed only via pre-save hook

        if (isAdmin && !isSuperAdmin) {
            if (isSelf) {
                const sensitiveFields = ['role', 'permissionOverrides', 'isActive'];
                sensitiveFields.forEach(f => delete updates[f]);
            }
            if (updates.role === 'superadmin') {
                delete updates.role;
            }
        }

        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const query = { _id: req.params.id };
        if (req.user.role !== 'master-admin') query.organizationId = orgId;

        const user = await User.findOne(query);
        if (!user) return res.status(404).json({ message: 'User not found' });

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
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        let user;
        if (req.user.role === 'superadmin') {
            user = await User.findOneAndDelete({ _id: req.params.id, organizationId: orgId });
            if (user) await logActivity(req.user._id, 'DELETE_USER', 'users', { userId: req.params.id }, req, req.params.id, 'User');
        } else {
            user = await User.findOneAndUpdate({ _id: req.params.id, organizationId: orgId }, { isActive: false }, { new: true });
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
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const { type, name, url, note } = req.body;
        const user = await User.findOne({ _id: req.params.id, organizationId: orgId });
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
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const user = await User.findOne({ _id: req.params.id, organizationId: orgId });
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
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const { photo } = req.body;
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, organizationId: orgId },
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

        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, birthdays: [] });
        }

        const birthdays = await User.find({
            organizationId: orgId,
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
