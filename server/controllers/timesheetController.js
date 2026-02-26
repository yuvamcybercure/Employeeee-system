const Timesheet = require('../models/Timesheet');
const { logActivity } = require('../middleware/logger');

// GET /api/timesheets
exports.getTimesheets = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, timesheets: [] });
        }
        const { date, month, year, search, projectId, status, userId: targetUserId } = req.query;
        let filter = {
            organizationId: orgId,
        };

        // Role-based visibility logic
        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            if (targetUserId) {
                filter.userId = targetUserId;
            }
            // If no targetUserId, Admin sees all in organization (handled by removing restricted userId filter)
        } else {
            // Employees only see their own or collaborative tasks
            filter.$or = [
                { userId: req.user._id },
                { collaborators: req.user._id }
            ];
        }

        // Default: Current Day if no filters provided
        if (!date && !month && !year && !search) {
            filter.date = new Date().toISOString().split('T')[0];
        } else if (date) {
            filter.date = date;
        }

        if (month && year) {
            filter.date = { $regex: `^${year}-${month.padStart(2, '0')}` };
        } else if (year) {
            filter.date = { $regex: `^${year}-` };
        }

        if (search) {
            filter.$or = [
                { task: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (projectId) filter.projectId = projectId;
        if (status) filter.status = status;

        const timesheets = await Timesheet.find(filter)
            .populate('userId', 'name profilePhoto')
            .populate('projectId', 'name')
            .populate('collaborators', 'name profilePhoto')
            .sort({ date: -1, createdAt: -1 });

        res.json({ success: true, timesheets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/timesheets/stats
exports.getTimesheetStats = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, todayTotalMs: 0, monthTotalMs: 0, runningTask: null });
        }
        const { userId: targetUserId } = req.query;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const monthStr = todayStr.substring(0, 7); // YYYY-MM

        let filter = {
            organizationId: orgId,
        };

        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            filter.userId = targetUserId || req.user._id;
        } else {
            filter.$or = [
                { userId: req.user._id },
                { collaborators: req.user._id }
            ];
        }

        const [todayTasks, monthTasks] = await Promise.all([
            Timesheet.find({ ...filter, date: todayStr }),
            Timesheet.find({ ...filter, date: { $regex: `^${monthStr}` } })
        ]);

        const calcTotal = (tasks) => tasks.reduce((acc, t) => {
            let extra = 0;
            if (t.isRunning && t.startTime) {
                extra = Date.now() - new Date(t.startTime).getTime();
            }
            return acc + (t.totalMilliseconds || 0) + extra;
        }, 0);

        res.json({
            success: true,
            todayTotalMs: calcTotal(todayTasks),
            monthTotalMs: calcTotal(monthTasks),
            runningTask: todayTasks.find(t => t.isRunning)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/timesheets
exports.createTimesheet = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.status(400).json({ message: 'Must be in an organization context to create timesheet' });
        }

        const ts = await Timesheet.create({
            ...req.body,
            userId: req.user._id,
            organizationId: orgId,
            status: 'pending',
            logs: [{ action: 'CREATED', note: `Task created by ${req.user.name}` }]
        });
        res.status(201).json({ success: true, timesheet: ts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/timesheets/:id/timer
exports.toggleTimer = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const { action } = req.body; // 'start' or 'stop'
        const ts = await Timesheet.findOne({
            _id: req.params.id,
            organizationId: orgId,
            $or: [
                { userId: req.user._id },
                { collaborators: req.user._id }
            ]
        });

        if (!ts) return res.status(404).json({ message: 'Task not found or unauthorized' });

        if (action === 'start') {
            // Stop any other running task for today for THIS user
            await Timesheet.updateMany(
                {
                    isRunning: true,
                    $or: [
                        { userId: req.user._id },
                        { collaborators: req.user._id }
                    ]
                },
                { $set: { isRunning: false, startTime: null }, $push: { logs: { action: 'AUTO_STOPPED', note: `Other task started by ${req.user.name}` } } }
            );

            ts.isRunning = true;
            ts.startTime = new Date();
            ts.status = 'in_progress';
            ts.logs.push({ action: 'STARTED', note: `Timer started by ${req.user.name}` });
        } else {
            if (ts.isRunning && ts.startTime) {
                const diff = Date.now() - new Date(ts.startTime).getTime();
                ts.totalMilliseconds = (ts.totalMilliseconds || 0) + diff;
            }
            ts.isRunning = false;
            ts.startTime = null;
            ts.logs.push({ action: 'STOPPED', note: `Timer stopped by ${req.user.name}` });
        }

        await ts.save();
        res.json({ success: true, timesheet: ts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/timesheets/:id
exports.updateTimesheet = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const ts = await Timesheet.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id, organizationId: orgId, status: 'draft' },
            req.body,
            { new: true },
        );
        if (!ts) return res.status(404).json({ message: 'Timesheet not found or not editable' });
        res.json({ success: true, timesheet: ts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/timesheets/:id/submit
exports.submitTimesheet = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const ts = await Timesheet.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id, organizationId: orgId, status: 'draft' },
            { status: 'submitted' },
            { new: true },
        );
        if (!ts) return res.status(404).json({ message: 'Not found or already submitted' });
        await logActivity(req.user._id, 'SUBMIT_TIMESHEET', 'timesheets', { timesheetId: ts._id }, req, ts._id, 'Timesheet');
        res.json({ success: true, timesheet: ts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/timesheets/:id/review
exports.reviewTimesheet = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const { status, reviewNote } = req.body;
        const ts = await Timesheet.findOneAndUpdate(
            { _id: req.params.id, organizationId: orgId },
            { status, reviewNote, reviewedBy: req.user._id },
            { new: true },
        );
        if (!ts) return res.status(404).json({ message: 'Timesheet not found' });
        await logActivity(req.user._id, 'REVIEW_TIMESHEET', 'timesheets', { status }, req, ts._id, 'Timesheet');
        res.json({ success: true, timesheet: ts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/timesheets/:id
exports.deleteTimesheet = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        await Timesheet.findOneAndDelete({ _id: req.params.id, userId: req.user._id, organizationId: orgId, status: 'draft' });
        res.json({ success: true, message: 'Timesheet deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
