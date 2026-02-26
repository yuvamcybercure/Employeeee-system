const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);
router.get('/', requireRole('superadmin'), activityLogController.getLogs);
router.get('/all', requireRole('master-admin'), activityLogController.getAllLogs);

module.exports = router;
