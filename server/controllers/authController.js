const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RolePermission = require('../models/RolePermission');
const { logActivity } = require('../middleware/logger');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendToken = (res, user, statusCode = 200) => {
    const token = signToken(user._id);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(statusCode).json({ success: true, user: user.toSafeJSON ? user.toSafeJSON() : user });
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Fetch role permissions to send with user data
        const rolePerms = await RolePermission.findOne({ role: user.role });
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
        res.json({ success: true, user: userObj, permissions: rolePerms?.permissions || {} });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
    if (req.user) await logActivity(req.user._id, 'LOGOUT', 'auth', {}, req);
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const rolePerms = await RolePermission.findOne({ role: req.user.role });
        res.json({ success: true, user: req.user, permissions: rolePerms?.permissions || {} });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.comparePassword(currentPassword)))
            return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = newPassword;
        user.plainPassword = newPassword;
        await user.save();
        await logActivity(req.user._id, 'CHANGE_PASSWORD', 'auth', {}, req);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
