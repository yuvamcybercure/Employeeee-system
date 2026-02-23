const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect, requireRole('superadmin'));

router.get('/', activityLogController.getLogs);

module.exports = router;
