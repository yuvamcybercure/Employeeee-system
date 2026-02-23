const Suggestion = require('../models/Suggestion');
const { logActivity } = require('../middleware/logger');

// POST /api/suggestions
exports.createSuggestion = async (req, res) => {
    try {
        const suggestion = await Suggestion.create({ ...req.body, userId: req.user._id });
        res.status(201).json({ success: true, suggestion });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/suggestions
exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggestion.find()
            .populate('userId', 'name profilePhoto')
            .sort({ createdAt: -1 });
        res.json({ success: true, suggestions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/suggestions/:id/upvote
exports.upvoteSuggestion = async (req, res) => {
    try {
        const suggestion = await Suggestion.findById(req.params.id);
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
        const suggestion = await Suggestion.findByIdAndUpdate(
            req.params.id,
            { adminResponse, status, respondedBy: req.user._id, respondedAt: new Date() },
            { new: true }
        );
        await logActivity(req.user._id, 'RESPOND_SUGGESTION', 'suggestions', { status }, req, suggestion._id, 'Suggestion');
        res.json({ success: true, suggestion });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
