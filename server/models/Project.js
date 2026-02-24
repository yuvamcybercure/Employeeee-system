const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    client: { type: String, default: '' },
    status: {
        type: String,
        enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        default: 'planning',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    startDate: { type: Date },
    endDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    budget: { type: Number, default: 0 },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    attachments: [{ url: String, name: String, uploadedBy: mongoose.Schema.Types.ObjectId }],
    tasks: [{
        title: { type: String, required: true },
        description: { type: String, default: '' },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        dueDate: { type: Date },
        completedAt: { type: Date },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
