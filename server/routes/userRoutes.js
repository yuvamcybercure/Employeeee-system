const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', requireRole('superadmin', 'admin'), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', requireRole('superadmin'), userController.createUser);
router.patch('/:id', requireRole('superadmin'), userController.updateUser);
router.delete('/:id', requireRole('superadmin'), userController.deleteUser);
router.patch('/:id/photo', userController.updateProfilePhoto);

module.exports = router;
