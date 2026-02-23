const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect, requireRole('superadmin'));

router.get('/all', permissionController.getAllPermissions);
router.get('/:role', permissionController.getPermissions);
router.patch('/:role', permissionController.updatePermissions);

module.exports = router;
