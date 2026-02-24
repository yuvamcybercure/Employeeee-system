const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    date: { type: String, required: true },  // YYYY-MM-DD
    task: { type: String, required: true },
    description: { type: String, default: '' },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    estimatedTime: { type: Number, default: 0 }, // in hours
    totalMilliseconds: { type: Number, default: 0 },
    startTime: { type: Date, default: null },
    isRunning: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    logs: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }],
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, default: '' },
    billable: { type: Boolean, default: true },
}, { timestamps: true });

timesheetSchema.index({ userId: 1, date: 1 });
timesheetSchema.index({ projectId: 1, date: 1 });

module.exports = mongoose.model('Timesheet', timesheetSchema);
