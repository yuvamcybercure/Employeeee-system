const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/:receiverId', messageController.getMessages);
router.get('/groups/:groupId', messageController.getGroupMessages);
router.post('/', messageController.sendMessage);

module.exports = router;
