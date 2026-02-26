const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All master routes require master-admin role
router.use(protect, requireRole('master-admin'));

router.get('/stats', masterController.getGlobalStats);
router.get('/organizations', masterController.getOrganizations);
router.get('/users', masterController.getGlobalUsers);
router.get('/analytics', masterController.getGlobalAnalytics);
router.post('/organizations', masterController.createOrganization);
router.post('/organizations/:id/toggle', masterController.toggleOrganization);
router.post('/impersonate', masterController.impersonateUser);
router.post('/pulse', masterController.handlePulseWave);

module.exports = router;
