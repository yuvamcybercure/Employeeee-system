const mongoose = require('mongoose');

const suggestionCommentSchema = new mongoose.Schema({
    suggestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Suggestion', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('SuggestionComment', suggestionCommentSchema);
