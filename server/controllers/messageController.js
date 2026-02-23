const Message = require('../models/Message');
const User = require('../models/User');
const { uploadDocument } = require('../config/cloudinary');

// GET /api/messages/:receiverId
exports.getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: req.user._id, receiverId },
                { senderId: receiverId, receiverId: req.user._id }
            ]
        }).sort({ createdAt: 1 });
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/messages/groups/:groupId
exports.getGroupMessages = async (req, res) => {
    try {
        const messages = await Message.find({ groupId: req.params.groupId }).sort({ createdAt: 1 });
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/messages
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, groupId, content, type } = req.body;
        const message = await Message.create({
            senderId: req.user._id,
            receiverId,
            groupId,
            content,
            type: type || 'text'
        });
        res.status(201).json({ success: true, message });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
    try {
        // Get unique people the user has chatted with
        const sent = await Message.distinct('receiverId', { senderId: req.user._id, receiverId: { $ne: null } });
        const received = await Message.distinct('senderId', { receiverId: req.user._id });
        const userIds = [...new Set([...sent, ...received])];
        const users = await User.find({ _id: { $in: userIds } }).select('name profilePhoto department');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
