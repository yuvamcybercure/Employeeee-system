const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

router.get('/:id', organizationController.getOrganization);
router.patch('/:id', requireRole('superadmin'), organizationController.updateOrganization);

module.exports = router;
