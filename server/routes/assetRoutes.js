const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

// Asset Inventory
router.get('/', assetController.getAssets);
router.post('/', requireRole('superadmin', 'admin'), assetController.createAsset);
router.patch('/:id/assign', requireRole('superadmin', 'admin'), assetController.assignAsset);
router.patch('/:id/revoke', requireRole('superadmin', 'admin'), assetController.revokeAsset);
router.delete('/:id', requireRole('superadmin', 'admin'), assetController.deleteAsset);

// Asset Issues
router.post('/issues', assetController.reportIssue);
router.get('/issues', assetController.getIssues);
router.patch('/issues/:id', requireRole('superadmin', 'admin'), assetController.updateIssueStatus);

module.exports = router;
