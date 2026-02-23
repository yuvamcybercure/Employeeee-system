const ActivityLog = require('../models/ActivityLog');

// GET /api/logs
exports.getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, module } = req.query;
        const filter = {};
        if (module) filter.module = module;

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
