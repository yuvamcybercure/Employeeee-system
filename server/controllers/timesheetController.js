const Timesheet = require('../models/Timesheet');
const { logActivity } = require('../middleware/logger');

// GET /api/timesheets
exports.getTimesheets = async (req, res) => {
    try {
        const filter = req.user.role === 'employee' ? { userId: req.user._id } : {};
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.projectId) filter.projectId = req.query.projectId;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.date) filter.date = req.query.date;

        const timesheets = await Timesheet.find(filter)
            .populate('userId', 'name department')
            .populate('projectId', 'name')
            .populate('reviewedBy', 'name')
            .sort({ date: -1 });
        res.json({ success: true, timesheets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/timesheets
exports.createTimesheet = async (req, res) => {
    try {
        const ts = await Timesheet.create({ ...req.body, userId: req.user._id, status: 'draft' });
        res.status(201).json({ success: true, timesheet: ts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/timesheets/:id
exports.updateTimesheet = async (req, res) => {
    try {
        const ts = await Timesheet.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id, status: 'draft' },
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
        const ts = await Timesheet.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id, status: 'draft' },
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
        const { status, reviewNote } = req.body;
        const ts = await Timesheet.findByIdAndUpdate(
            req.params.id,
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
        await Timesheet.findOneAndDelete({ _id: req.params.id, userId: req.user._id, status: 'draft' });
        res.json({ success: true, message: 'Timesheet deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
