const Leave = require('../models/Leave');
const User = require('../models/User');
const { logActivity } = require('../middleware/logger');

// POST /api/leaves  - Employee applies for leave
exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / 86400000) + 1;

        const leave = await Leave.create({ userId: req.user._id, type, startDate: start, endDate: end, totalDays, reason });
        await logActivity(req.user._id, 'APPLY_LEAVE', 'leaves', { type, startDate, endDate, totalDays }, req, leave._id, 'Leave');
        res.status(201).json({ success: true, leave });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/leaves  - Employee sees own leaves / Admin sees team leaves
exports.getLeaves = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'employee') {
            filter.userId = req.user._id;
        } else if (req.user.role === 'admin') {
            // Get IDs of team members
            const teamMembers = await User.find({ managedBy: req.user._id }).select('_id');
            filter.userId = { $in: teamMembers.map(u => u._id) };
        }
        // Superadmin: no filter (sees all)
        const { status, month, year } = req.query;
        if (status) filter.status = status;
        if (month && year) {
            filter.startDate = { $gte: new Date(`${year}-${month}-01`), $lte: new Date(`${year}-${month}-31`) };
        }

        const leaves = await Leave.find(filter)
            .populate('userId', 'name department profilePhoto')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, leaves });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/leaves/:id
exports.getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('userId', 'name department').populate('reviewedBy', 'name');
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        res.json({ success: true, leave });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/leaves/:id/review  - Admin/Superadmin approves or rejects
exports.reviewLeave = async (req, res) => {
    try {
        const { status, reviewNote } = req.body; // status: 'approved' | 'rejected'
        if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, reviewNote, reviewedBy: req.user._id, reviewedAt: new Date() },
            { new: true },
        ).populate('userId', 'name email');

        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        await logActivity(req.user._id, 'REVIEW_LEAVE', 'leaves', { status, reviewNote }, req, leave._id, 'Leave');
        res.json({ success: true, leave });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/leaves/:id  - Employee cancels own pending leave
exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findOne({ _id: req.params.id, userId: req.user._id });
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        if (leave.status !== 'pending') return res.status(400).json({ message: 'Cannot cancel a non-pending leave' });
        leave.status = 'cancelled';
        await leave.save();
        res.json({ success: true, message: 'Leave cancelled' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/leaves/balance/:userId
exports.getLeaveBalance = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;
        const year = new Date().getFullYear();
        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31`);
        const approved = await Leave.find({ userId, status: 'approved', startDate: { $gte: startOfYear, $lte: endOfYear } });
        const usedDays = approved.reduce((sum, l) => sum + l.totalDays, 0);
        // Default annual leave entitlement (configurable)
        const entitlements = { casual: 12, sick: 10, earned: 15 };
        const used = {};
        approved.forEach(l => { used[l.type] = (used[l.type] || 0) + l.totalDays; });
        res.json({ success: true, entitlements, used, totalUsed: usedDays });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
