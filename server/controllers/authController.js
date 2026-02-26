// SECURITY FIXES APPLIED:
// - Fix #1: All plainPassword references removed
// - Fix #2: Password reset now hashes password before storing
// - Fix #4: Removed hardcoded Windows debug log path, replaced with Winston logger

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const RolePermission = require('../models/RolePermission');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { logActivity } = require('../middleware/logger');
const logger = require('../config/logger');

const mergePermissions = async (user) => {
    if (user.role === 'superadmin') return {};

    const rolePerms = await RolePermission.findOne({
        role: user.role,
        organizationId: user.organizationId?._id || user.organizationId
    });

    const basePermissions = rolePerms?.permissions ? rolePerms.permissions.toObject() : {};
    const overrides = user.permissionOverrides || {};

    const merged = { ...basePermissions };
    Object.keys(overrides).forEach(key => {
        if (overrides[key] !== null) merged[key] = overrides[key];
    });

    return merged;
};

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.signToken = signToken;

const sendToken = (res, user, statusCode = 200) => {
    const token = signToken(user._id);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(statusCode).json({ success: true, user: user.toSafeJSON ? user.toSafeJSON() : user });
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        logger.info(`Login attempt for: ${email}`);

        if (!email || !password) {
            logger.warn('Login failed: Email or password missing');
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email }).select('+password').populate('organizationId', 'name slug logo settings');
        if (!user) {
            logger.warn(`Login failed: User not found for ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            logger.warn(`Login failed: Password mismatch for ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            logger.warn(`Login failed: Account deactivated for ${email}`);
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        logger.info(`Login successful for: ${user.email}`);
        const permissions = await mergePermissions(user);
        await logActivity(user._id, 'LOGIN', 'auth', { email }, req);

        const token = signToken(user._id);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const userObj = user.toSafeJSON ? user.toSafeJSON() : user.toObject();
        delete userObj.password;
        res.json({ success: true, user: userObj, permissions });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
    if (req.user) await logActivity(req.user._id, 'LOGOUT', 'auth', {}, req);
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const permissions = await mergePermissions(req.user);
        res.json({ success: true, user: req.user, permissions });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.comparePassword(currentPassword)))
            return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = newPassword;
        // SECURITY: plainPassword sync removed
        await user.save();
        await logActivity(req.user._id, 'CHANGE_PASSWORD', 'auth', {}, req);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/request-reset (Public)
exports.requestPasswordReset = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ message: 'Email and new password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User with this email does not exist' });

        const existingRequest = await PasswordResetRequest.findOne({ userId: user._id, status: 'pending' });
        if (existingRequest) return res.status(400).json({ message: 'A reset request is already pending for this user' });

        // SECURITY FIX #2: Hash the password BEFORE storing it in the reset request
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await PasswordResetRequest.create({
            userId: user._id,
            email,
            newPassword: hashedPassword // Stored pre-hashed, never plaintext
        });

        await logActivity(user._id, 'RESET_REQUESTED', 'auth', { email }, req);
        res.json({ success: true, message: 'Password reset request submitted. Please wait for admin approval.' });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/reset-requests (Superadmin only)
exports.getResetRequests = async (req, res, next) => {
    try {
        const requests = await PasswordResetRequest.find({ status: 'pending' })
            .populate('userId', 'name email role')
            .select('-newPassword'); // Never expose hashed passwords in API responses
        res.json({ success: true, requests });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/process-reset/:id (Superadmin only)
exports.processResetRequest = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

        const resetReq = await PasswordResetRequest.findById(req.params.id);
        if (!resetReq) return res.status(404).json({ message: 'Request not found' });
        if (resetReq.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

        if (status === 'approved') {
            const user = await User.findById(resetReq.userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // SECURITY FIX #2: Apply the already-hashed password directly.
            // We must bypass the pre-save hook since password is already hashed.
            await User.updateOne(
                { _id: resetReq.userId },
                { $set: { password: resetReq.newPassword } }
            );
        }

        resetReq.status = status;
        resetReq.processedAt = new Date();
        resetReq.processedBy = req.user._id;
        await resetReq.save();

        await logActivity(req.user._id, `RESET_${status.toUpperCase()}`, 'auth', { targetUser: resetReq.userId }, req);
        res.json({ success: true, message: `Request ${status} successfully` });
    } catch (err) {
        next(err);
    }
};
