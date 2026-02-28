const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/messages');
    },
    filename: (req, file, cb) => {
        cb(null, `msg_${Date.now()}_${path.basename(file.originalname)}`);
    }
});

const upload = multer({ storage });

router.use(protect);

router.get('/unread-count', messageController.getUnreadCount);
router.get('/conversations', messageController.getConversations);
router.get('/groups/:groupId', messageController.getGroupMessages);
router.post('/groups', messageController.createGroup);
router.patch('/mark-read', messageController.markAsRead);
router.post('/', upload.array('attachments', 5), messageController.sendMessage);
router.get('/:receiverId', messageController.getMessages);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
