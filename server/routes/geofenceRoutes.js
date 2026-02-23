const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofenceController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', geofenceController.getGeofence);
router.put('/', requireRole('superadmin'), geofenceController.updateGeofence);

module.exports = router;
