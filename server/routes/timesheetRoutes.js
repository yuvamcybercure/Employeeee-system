const express = require('express');
const router = express.Router();
const timesheetController = require('../controllers/timesheetController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', timesheetController.getTimesheets);
router.get('/stats', timesheetController.getTimesheetStats);
router.post('/', timesheetController.createTimesheet);
router.patch('/:id', timesheetController.updateTimesheet);
router.patch('/:id/timer', timesheetController.toggleTimer);
router.patch('/:id/submit', timesheetController.submitTimesheet);
router.patch('/:id/review', requirePermission('canApproveLeave'), timesheetController.reviewTimesheet);
router.delete('/:id', timesheetController.deleteTimesheet);

module.exports = router;
