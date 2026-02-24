const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

// Asset Inventory
router.get('/', assetController.getAssets);
router.post('/', requireRole('superadmin'), assetController.createAsset);
router.patch('/:id/assign', requireRole('superadmin'), assetController.assignAsset);
router.patch('/:id/revoke', requireRole('superadmin'), assetController.revokeAsset);
router.delete('/:id', requireRole('superadmin'), assetController.deleteAsset);

// Asset Issues
router.post('/issues', assetController.reportIssue);
router.get('/issues', assetController.getIssues);
router.patch('/issues/:id', requireRole('superadmin'), assetController.updateIssueStatus);

module.exports = router;
