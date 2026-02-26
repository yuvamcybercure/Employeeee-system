const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);
router.use(requireRole('superadmin'));

router.get('/roles', permissionController.getRolePermissions);
router.post('/roles', permissionController.updateRolePermissions);

router.get('/users/:id', permissionController.getUserWithPermissions);
router.put('/users/:id', permissionController.updateUserPermissions);

module.exports = router;
