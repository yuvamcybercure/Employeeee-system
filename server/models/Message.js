const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup' }, // Referencing new ChatGroup model
    content: { type: String, default: '' },
    attachments: [{ url: String, name: String, type: String }],
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    readBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
    }],
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // "Delete for me"
    isDeletedForEveryone: { type: Boolean, default: false }, // "Delete for everyone"
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ groupId: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
