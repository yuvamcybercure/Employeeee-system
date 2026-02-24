const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/change-password', protect, authController.changePassword);

// Password Reset Flow
router.post('/request-reset', authController.requestPasswordReset);
router.get('/reset-requests', protect, authController.getResetRequests);
router.post('/process-reset/:id', protect, authController.processResetRequest);

module.exports = router;
