const GeofenceSettings = require('../models/GeofenceSettings');
const { logActivity } = require('../middleware/logger');

// GET /api/geofence
exports.getSettings = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, settings: { officeName: 'Global Matrix', radiusMeters: 0 } });
        }

        let settings = await GeofenceSettings.findOne({ organizationId: orgId });
        if (!settings) {
            settings = await GeofenceSettings.create({
                organizationId: orgId,
                lat: 0,
                lng: 0,
                officeName: 'Head Office'
            });
        }
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/geofence
exports.updateSettings = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.status(400).json({ message: 'Must be in an organization context to update geofence' });
        }

        const settings = await GeofenceSettings.findOneAndUpdate(
            { organizationId: orgId },
            { ...req.body, updatedBy: req.user._id },
            { new: true, upsert: true, runValidators: true }
        );
        await logActivity(req.user._id, 'UPDATE_GEOFENCE', 'settings', req.body, req, settings._id, 'GeofenceSettings');
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
