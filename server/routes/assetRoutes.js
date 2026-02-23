const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', assetController.getAssets);
router.post('/', requirePermission('canManageAssets'), assetController.createAsset);
router.patch('/:id/assign', requirePermission('canManageAssets'), assetController.assignAsset);

module.exports = router;
