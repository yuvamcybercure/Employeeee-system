const ActivityLog = require('../models/ActivityLog');

// GET /api/activity-logs
exports.getLogs = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, logs: [], totalPages: 0, currentPage: 1 });
        }
        const { page = 1, limit = 50, module } = req.query;
        const filter = { organizationId: orgId };
        if (module) filter.module = module;
        if (req.user.role === 'admin') filter.userId = req.user._id;

        const logs = await ActivityLog.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await ActivityLog.countDocuments(filter);
        res.json({
            success: true,
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/activity-logs/all (Master Admin only)
exports.getAllLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const logLimit = parseInt(limit);

        const [logs, total] = await Promise.all([
            ActivityLog.find()
                .populate('userId', 'name email')
                .populate('organizationId', 'name')
                .sort({ createdAt: -1 })
                .limit(logLimit)
                .skip(skip),
            ActivityLog.countDocuments()
        ]);

        res.json({
            success: true,
            logs,
            totalPages: Math.ceil(total / logLimit),
            currentPage: parseInt(page),
            totalLogs: total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
