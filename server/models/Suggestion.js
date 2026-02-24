const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['workplace', 'process', 'technology', 'culture', 'benefits', 'other'],
        default: 'other',
    },
    status: {
        type: String,
        enum: ['pending', 'under-review', 'accepted', 'rejected', 'implemented'],
        default: 'pending',
    },
    isAnonymous: { type: Boolean, default: false },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    adminResponse: { type: String, default: '' },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', suggestionSchema);
