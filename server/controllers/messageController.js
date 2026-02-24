const Message = require('../models/Message');
const User = require('../models/User');
const ChatGroup = require('../models/ChatGroup');
const mongoose = require('mongoose');

// GET /api/messages/:receiverId
exports.getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            organizationId: req.user.organizationId._id,
            $or: [
                { senderId: currentUserId, receiverId },
                { senderId: receiverId, receiverId: currentUserId }
            ],
            deletedFor: { $ne: currentUserId }, // Filter out "Delete for me"
            // isDeletedForEveryone logic usually shows "This message was deleted"
        }).sort({ createdAt: 1 });

        // Transform messages if deleted for everyone
        const transformedMessages = messages.map(m => {
            if (m.isDeletedForEveryone) {
                return { ...m.toObject(), content: 'This message was deleted' };
            }
            return m;
        });

        res.json({ success: true, messages: transformedMessages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/messages/groups/:groupId
exports.getGroupMessages = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const messages = await Message.find({
            organizationId: req.user.organizationId._id,
            groupId: req.params.groupId,
            deletedFor: { $ne: currentUserId }
        }).sort({ createdAt: 1 });

        const transformedMessages = messages.map(m => {
            if (m.isDeletedForEveryone) {
                return { ...m.toObject(), content: 'This message was deleted' };
            }
            return m;
        });

        res.json({ success: true, messages: transformedMessages });
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
            organizationId: req.user.organizationId._id,
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

// PATCH /api/messages/mark-read
exports.markAsRead = async (req, res) => {
    try {
        const { senderId, groupId } = req.body;
        const currentUserId = req.user._id;

        let query = {
            organizationId: req.user.organizationId._id,
            'readBy.userId': { $ne: currentUserId }
        };

        if (groupId) {
            query.groupId = groupId;
        } else {
            query.senderId = senderId;
            query.receiverId = currentUserId;
        }

        await Message.updateMany(query, {
            $push: { readBy: { userId: currentUserId, readAt: new Date() } }
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/messages/:messageId
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { mode } = req.query; // 'me' or 'everyone'
        const currentUserId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        if (mode === 'everyone') {
            if (message.senderId.toString() !== currentUserId.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            message.isDeletedForEveryone = true;
        } else {
            // Delete for me
            if (!message.deletedFor.includes(currentUserId)) {
                message.deletedFor.push(currentUserId);
            }
        }

        await message.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/messages/groups
exports.createGroup = async (req, res) => {
    try {
        const { name, members, description, avatar } = req.body;
        const group = await ChatGroup.create({
            name,
            description,
            avatar,
            organizationId: req.user.organizationId._id,
            adminId: req.user._id,
            members: [...new Set([...members, req.user._id])]
        });
        res.status(201).json({ success: true, group });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
    try {
        const orgId = req.user.organizationId._id;
        const currentUserId = req.user._id;

        // 1. Get all users
        const colleagues = await User.find({
            organizationId: orgId,
            _id: { $ne: currentUserId },
            isActive: true
        }).select('name profilePhoto department role');

        // 2. Get custom groups where user is a member
        const customGroups = await ChatGroup.find({
            organizationId: orgId,
            members: currentUserId,
            isActive: true
        });

        // 3. For each, fetch the last message
        const conversations = await Promise.all([
            ...colleagues.map(async (col) => {
                const lastMsg = await Message.findOne({
                    organizationId: orgId,
                    $or: [
                        { senderId: currentUserId, receiverId: col._id },
                        { senderId: col._id, receiverId: currentUserId }
                    ],
                    deletedFor: { $ne: currentUserId }
                }).sort({ createdAt: -1 });

                const unreadCount = await Message.countDocuments({
                    organizationId: orgId,
                    senderId: col._id,
                    receiverId: currentUserId,
                    'readBy.userId': { $ne: currentUserId }
                });

                return {
                    id: col._id,
                    name: col.name,
                    profilePhoto: col.profilePhoto,
                    type: 'dm',
                    lastMessage: lastMsg?.isDeletedForEveryone ? 'This message was deleted' : (lastMsg?.content || ''),
                    lastTime: lastMsg?.createdAt || null,
                    unread: unreadCount
                };
            }),
            ...customGroups.map(async (group) => {
                const lastMsg = await Message.findOne({
                    organizationId: orgId,
                    groupId: group._id,
                    deletedFor: { $ne: currentUserId }
                }).sort({ createdAt: -1 });

                const unreadCount = await Message.countDocuments({
                    organizationId: orgId,
                    groupId: group._id,
                    senderId: { $ne: currentUserId },
                    'readBy.userId': { $ne: currentUserId }
                });

                return {
                    id: group._id,
                    name: group.name,
                    profilePhoto: group.avatar,
                    type: 'group',
                    lastMessage: lastMsg?.isDeletedForEveryone ? 'This message was deleted' : (lastMsg?.content || ''),
                    lastTime: lastMsg?.createdAt || null,
                    unread: unreadCount
                };
            })
        ]);

        const activeConversations = conversations
            .sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));

        res.json({ success: true, conversations: activeConversations });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
