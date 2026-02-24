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

        const leave = await Leave.create({
            userId: req.user._id,
            organizationId: req.user.organizationId._id,
            type,
            startDate: start,
            endDate: end,
            totalDays,
            reason
        });
        await logActivity(req.user._id, 'APPLY_LEAVE', 'leaves', { type, startDate, endDate, totalDays }, req, leave._id, 'Leave');
        res.status(201).json({ success: true, leave });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/leaves  - Employee sees own leaves / Admin sees team leaves
exports.getLeaves = async (req, res) => {
    try {
        let filter = { organizationId: req.user.organizationId._id };
        if (req.user.role === 'employee') {
            filter.userId = req.user._id;
        } else if (req.user.role === 'admin') {
            // Get IDs of team members
            const teamMembers = await User.find({ managedBy: req.user._id }).select('_id');
            filter.userId = { $in: teamMembers.map(u => u._id) };
        }
        const { status, month, year } = req.query;
        if (status) filter.status = status;
        if (month && year) {
            const startOfFilter = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endOfFilter = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            filter.startDate = { $gte: startOfFilter, $lte: endOfFilter };
        }

        const leaves = await Leave.find(filter)
            .populate('userId', 'name department profilePhoto')
            .populate('reviewedBy', 'name employeeId')
            .sort({ createdAt: -1 });
        res.json({ success: true, leaves });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/leaves/:id
exports.getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('userId', 'name department').populate('reviewedBy', 'name employeeId');
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
        const user = await User.findById(userId).select('leaveEntitlements');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        const approved = await Leave.find({
            userId,
            status: 'approved',
            startDate: { $gte: startOfYear, $lte: endOfYear }
        });

        const entitlements = user.leaveEntitlements || {
            sick: { yearly: 12, monthly: 1 },
            casual: { yearly: 12, monthly: 1 },
            wfh: { yearly: 24, monthly: 2 },
            unpaid: { yearly: 365, monthly: 31 }
        };

        const breakdown = {};
        Object.keys(entitlements).forEach(type => {
            const usedYear = approved
                .filter(l => l.type === type)
                .reduce((sum, l) => sum + l.totalDays, 0);

            const usedMonth = approved
                .filter(l => l.type === type && l.startDate >= startOfMonth && l.startDate <= endOfMonth)
                .reduce((sum, l) => sum + l.totalDays, 0);

            breakdown[type] = {
                usedMonth,
                usedYear,
                quotaMonth: entitlements[type].monthly,
                quotaYear: entitlements[type].yearly
            };
        });

        res.json({ success: true, balance: breakdown });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
