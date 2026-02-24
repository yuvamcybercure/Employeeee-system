const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', policyController.getPolicies);
router.post('/', requireRole('superadmin'), policyController.createPolicy);
router.patch('/:id/acknowledge', policyController.acknowledgePolicy);

module.exports = router;
