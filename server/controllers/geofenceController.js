const GeofenceSettings = require('../models/GeofenceSettings');
const { logActivity } = require('../middleware/logger');

// GET /api/geofence
exports.getGeofence = async (req, res) => {
    try {
        const geofence = await GeofenceSettings.findOne({}).populate('updatedBy', 'name');
        res.json({ success: true, geofence });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/geofence
exports.updateGeofence = async (req, res) => {
    try {
        const { officeName, lat, lng, radiusMeters, isActive } = req.body;
        const geofence = await GeofenceSettings.findOneAndUpdate(
            {},
            { officeName, lat, lng, radiusMeters, isActive, updatedBy: req.user._id },
            { upsert: true, new: true, runValidators: true },
        );
        await logActivity(req.user._id, 'UPDATE_GEOFENCE', 'settings', { lat, lng, radiusMeters }, req, geofence._id, 'GeofenceSettings');
        res.json({ success: true, geofence });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
