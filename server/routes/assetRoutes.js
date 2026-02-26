const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', requirePermission('canViewAssets'), assetController.getAssets);
router.post('/', requirePermission('canManageAssets'), assetController.createAsset);
router.patch('/:id/assign', requirePermission('canManageAssets'), assetController.assignAsset);
router.patch('/:id/revoke', requirePermission('canManageAssets'), assetController.revokeAsset);
router.delete('/:id', requirePermission('canManageAssets'), assetController.deleteAsset);

// Issues
router.get('/issues', requirePermission('canViewAssets'), assetController.getIssues);
router.post('/issues', assetController.reportIssue);
router.patch('/issues/:id', requirePermission('canManageAssets'), assetController.updateIssueStatus);

module.exports = router;
