const GeofenceSettings = require('../models/GeofenceSettings');
const { logActivity } = require('../middleware/logger');

// GET /api/geofence
exports.getSettings = async (req, res) => {
    try {
        let settings = await GeofenceSettings.findOne({ organizationId: req.user.organizationId._id });
        if (!settings) {
            settings = await GeofenceSettings.create({
                organizationId: req.user.organizationId._id,
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
        const settings = await GeofenceSettings.findOneAndUpdate(
            { organizationId: req.user.organizationId._id },
            { ...req.body, updatedBy: req.user._id },
            { new: true, upsert: true, runValidators: true }
        );
        await logActivity(req.user._id, 'UPDATE_GEOFENCE', 'settings', req.body, req, settings._id, 'GeofenceSettings');
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
