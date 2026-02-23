const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    date: { type: String, required: true },  // YYYY-MM-DD
    task: { type: String, required: true },
    description: { type: String, default: '' },
    hoursWorked: { type: Number, required: true, min: 0, max: 24 },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
        default: 'draft',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, default: '' },
    billable: { type: Boolean, default: true },
}, { timestamps: true });

timesheetSchema.index({ userId: 1, date: 1 });
timesheetSchema.index({ projectId: 1, date: 1 });

module.exports = mongoose.model('Timesheet', timesheetSchema);
