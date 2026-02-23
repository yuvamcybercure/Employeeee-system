const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

module.exports = mongoose.model('ActivityLog', activityLogSchema);
