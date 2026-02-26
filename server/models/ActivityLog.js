const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // system can be null
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Optional for system-wide logs
    action: { type: String, required: true },        // e.g. "UPDATED_PERMISSION"
    module: { type: String, required: true },         // e.g. "permissions", "attendance"
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetModel: { type: String },                    // "User", "Policy", etc.
    details: { type: mongoose.Schema.Types.Mixed },   // JSON diff or description
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
}, { timestamps: true });

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ organizationId: 1, createdAt: -1 }); // Fix #8: Compound index

module.exports = mongoose.model('ActivityLog', activityLogSchema);
