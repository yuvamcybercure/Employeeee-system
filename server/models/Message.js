const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   // null = group
    groupId: { type: String },   // for group chats (e.g., department name)
    content: { type: String, default: '' },
    attachments: [{ url: String, name: String, type: String }],
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ groupId: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
