const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/history', attendanceController.getHistory);

// Admin View
router.get('/overview', requirePermission('canViewAttendance'), attendanceController.getOverview);
router.get('/weekly', requirePermission('canViewAttendance'), attendanceController.getWeeklySummary);
router.patch('/:id/approve', requirePermission('canEditAttendance'), attendanceController.approveAttendance);

module.exports = router;
