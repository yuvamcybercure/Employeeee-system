const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect, requirePermission('canViewReports'));

router.get('/attendance-pdf', reportController.generateAttendancePDF);
router.get('/attendance-excel', reportController.generateAttendanceExcel);

module.exports = router;
