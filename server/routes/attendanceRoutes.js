const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');

router.use(protect);

router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/history', attendanceController.getHistory);

router.get('/overview', attendanceController.getOverview);
router.get('/weekly-summary', requireRole('superadmin', 'admin'), attendanceController.getWeeklySummary);
router.patch('/:id/approve', requirePermission('canEditAttendance'), attendanceController.approveAttendance);

module.exports = router;
