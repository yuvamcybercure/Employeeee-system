const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

router.post('/', leaveController.applyLeave);
router.get('/', leaveController.getLeaves);
router.get('/balance', leaveController.getLeaveBalance);
router.get('/balance/:userId', leaveController.getLeaveBalance);
router.get('/:id', leaveController.getLeaveById);
router.patch('/:id/review', requirePermission('canApproveLeave'), leaveController.reviewLeave);
router.delete('/:id', leaveController.cancelLeave);

module.exports = router;
