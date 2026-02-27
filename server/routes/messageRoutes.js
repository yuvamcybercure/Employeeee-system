const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/unread-count', messageController.getUnreadCount);
router.get('/conversations', messageController.getConversations);
router.get('/groups/:groupId', messageController.getGroupMessages);
router.post('/groups', messageController.createGroup);
router.patch('/mark-read', messageController.markAsRead);
router.post('/', messageController.sendMessage);
router.get('/:receiverId', messageController.getMessages);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
