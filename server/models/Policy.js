const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ['hr', 'it', 'finance', 'security', 'leave', 'code-of-conduct', 'other'],
        default: 'hr',
    },
    content: { type: String, required: true },  // Rich text / markdown
    version: { type: String, default: '1.0' },
    effectiveDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    applicableTo: [{ type: String, enum: ['superadmin', 'admin', 'employee'] }],
    attachment: { type: String, default: '' },  // Cloudinary URL (PDF)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    acknowledgedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        acknowledgedAt: { type: Date },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
