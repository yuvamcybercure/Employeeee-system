const mongoose = require('mongoose');

const assetIssueSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueType: {
        type: String,
        enum: ['damage', 'malfunction', 'software', 'lost', 'other'],
        default: 'malfunction'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'dismissed'],
        default: 'open'
    },
    adminNote: { type: String, default: '' },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AssetIssue', assetIssueSchema);
