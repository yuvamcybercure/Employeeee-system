const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    center: { type: String, default: 'Head Office' },
    lat: { type: Number, required: true, default: 0 },
    lng: { type: Number, required: true, default: 0 },
    radiusMeters: { type: Number, default: 200, min: 50, max: 5000 },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('GeofenceSettings', geofenceSchema);
