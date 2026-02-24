const SuggestionComment = require('../models/SuggestionComment');
const Suggestion = require('../models/Suggestion');
const { logActivity } = require('../middleware/logger');

// POST /api/suggestions
exports.createSuggestion = async (req, res) => {
    try {
        const suggestion = await Suggestion.create({
            ...req.body,
            userId: req.user._id,
            organizationId: req.user.organizationId._id
        });
        res.status(201).json({ success: true, suggestion });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/suggestions
exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggestion.find({ organizationId: req.user.organizationId._id })
            .populate('userId', 'name profilePhoto')
            .sort({ createdAt: -1 });
        res.json({ success: true, suggestions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/suggestions/:id/comments
exports.addComment = async (req, res) => {
    try {
        const comment = await SuggestionComment.create({
            suggestionId: req.params.id,
            userId: req.user._id,
            organizationId: req.user.organizationId._id,
            content: req.body.content
        });
        const populatedComment = await SuggestionComment.findById(comment._id).populate('userId', 'name profilePhoto');
        res.status(201).json({ success: true, comment: populatedComment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/suggestions/:id/comments
exports.getComments = async (req, res) => {
    try {
        const comments = await SuggestionComment.find({
            suggestionId: req.params.id,
            organizationId: req.user.organizationId._id
        })
            .populate('userId', 'name profilePhoto')
            .sort({ createdAt: 1 });
        res.json({ success: true, comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/suggestions/:id/upvote
exports.upvoteSuggestion = async (req, res) => {
    try {
        const suggestion = await Suggestion.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id });
        if (!suggestion) return res.status(404).json({ message: 'Suggestion not found' });

        const index = suggestion.upvotes.indexOf(req.user._id);
        if (index === -1) {
            suggestion.upvotes.push(req.user._id);
        } else {
            suggestion.upvotes.splice(index, 1);
        }
        await suggestion.save();
        res.json({ success: true, upvotes: suggestion.upvotes.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/suggestions/:id/respond (Admin only)
exports.respondToSuggestion = async (req, res) => {
    try {
        const { adminResponse, status } = req.body;
        const suggestion = await Suggestion.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId._id },
            { adminResponse, status, respondedBy: req.user._id, respondedAt: new Date() },
            { new: true }
        );
        await logActivity(req.user._id, 'RESPOND_SUGGESTION', 'suggestions', { status }, req, suggestion._id, 'Suggestion');
        res.json({ success: true, suggestion });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
