const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', requireRole('superadmin', 'admin', 'employee'), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', requireRole('superadmin'), userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', requireRole('superadmin'), userController.deleteUser);
router.patch('/:id/photo', userController.updateProfilePhoto);

// Document Management
router.post('/:id/documents', userController.uploadDocument);
router.delete('/:id/documents/:docId', userController.deleteDocument);

// Birthdays
router.get('/birthdays/today', userController.getTodayBirthdays);

module.exports = router;
