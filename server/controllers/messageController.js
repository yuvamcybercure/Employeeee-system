const Message = require('../models/Message');
const User = require('../models/User');
const ChatGroup = require('../models/ChatGroup');
const mongoose = require('mongoose');

// GET /api/messages/:receiverId
exports.getMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const currentUserId = req.user._id;

        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, messages: [] });
        }

        const messages = await Message.find({
            organizationId: orgId,
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
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, messages: [] });
        }

        const messages = await Message.find({
            organizationId: orgId,
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

const notificationService = require('../services/notificationService');

// POST /api/messages
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, groupId, content } = req.body;
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.status(400).json({ message: 'Must be in an organization context to send messages' });
        }

        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => ({
                url: `/public/uploads/messages/${file.filename}`,
                name: file.originalname,
                type: file.mimetype.startsWith('image/') ? 'image' : 'file'
            }));
        }

        const messageData = {
            senderId: req.user._id,
            organizationId: orgId,
            receiverId: receiverId || null,
            groupId: groupId || null,
            content: content || '',
            attachments,
            type: attachments.length > 0 ? (attachments[0].type === 'image' ? 'image' : 'file') : 'text'
        };

        const message = await (await Message.create(messageData)).populate('senderId', 'name profilePhoto');

        // --- Push Notification ---
        if (receiverId) {
            const receiver = await User.findById(receiverId);
            if (receiver?.expoPushToken) {
                notificationService.sendPushNotification(receiver.expoPushToken, {
                    title: `New message from ${req.user.name}`,
                    body: content || (attachments.length > 0 ? 'Sent an attachment' : 'New message'),
                    data: { conversationId: req.user._id, type: 'chat' }
                });
            }
        } else if (groupId) {
            const group = await ChatGroup.findById(groupId).populate('members');
            const otherMembers = group.members.filter(m => m._id.toString() !== req.user._id.toString());
            const tokens = otherMembers.map(m => m.expoPushToken).filter(t => !!t);
            if (tokens.length > 0) {
                notificationService.sendPushNotification(tokens, {
                    title: `${group.name}: ${req.user.name}`,
                    body: content || (attachments.length > 0 ? 'Sent an attachment' : 'New message'),
                    data: { conversationId: groupId, type: 'group_chat' }
                });
            }
        }

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

        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true });
        }

        let query = {
            organizationId: orgId,
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

const fs = require('fs');
const path = require('path');

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

            // Physically delete attachments if they exist
            if (message.attachments && message.attachments.length > 0) {
                message.attachments.forEach(att => {
                    const filePath = path.join(__dirname, '..', att.url);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });
            }

            message.isDeletedForEveryone = true;
            message.attachments = [];
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
            organizationId: req.user.organizationId?._id || req.user.organizationId,
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
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, conversations: [] });
        }
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

// GET /api/messages/unread-count
exports.getUnreadCount = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, count: 0 });
        }
        const currentUserId = req.user._id;

        // 1. Unread DM counts
        const dmUnread = await Message.countDocuments({
            organizationId: orgId,
            receiverId: currentUserId,
            'readBy.userId': { $ne: currentUserId },
            deletedFor: { $ne: currentUserId }
        });

        // 2. Unread Group counts
        // Need to find which groups the user is in first
        const userGroups = await ChatGroup.find({
            organizationId: orgId,
            members: currentUserId,
            isActive: true
        }).select('_id');

        const groupIds = userGroups.map(g => g._id);

        const groupUnread = await Message.countDocuments({
            organizationId: orgId,
            groupId: { $in: groupIds },
            senderId: { $ne: currentUserId },
            'readBy.userId': { $ne: currentUserId },
            deletedFor: { $ne: currentUserId }
        });

        res.json({ success: true, count: dmUnread + groupUnread });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
