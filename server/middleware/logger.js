const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, module, details = {}, req = null, targetId = null, targetModel = null) => {
    try {
        await ActivityLog.create({
            userId,
            action,
            module,
            targetId,
            targetModel,
            details,
            ip: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : '',
            userAgent: req ? (req.headers['user-agent'] || '') : '',
        });
    } catch (err) {
        console.error('Activity log error:', err.message);
    }
};

module.exports = { logActivity };
