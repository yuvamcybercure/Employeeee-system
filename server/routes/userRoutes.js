const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { uploadProfile } = require('../config/localStorage');

router.use(protect);

// Birthdays
router.get('/birthdays/today', userController.getTodayBirthdays);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', uploadProfile.single('profilePhoto'), userController.updateProfile);
router.put('/bank-details', userController.updateBankDetails);
router.put('/push-token', userController.updatePushToken);

// Management
router.get('/', requirePermission('canViewEmployees'), userController.getAllUsers);
router.post('/', requirePermission('canAddEmployee'), userController.createUser);
router.get('/:id', requirePermission('canViewEmployees'), userController.getUserById);
router.put('/:id', requirePermission('canEditEmployee'), userController.updateUser);
router.delete('/:id', requirePermission('canEditEmployee'), userController.deleteUser);

module.exports = router;
