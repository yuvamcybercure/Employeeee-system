const mongoose = require('mongoose');

const captureSchema = new mongoose.Schema({
    time: { type: Date },
    photo: { type: String, default: '' },        // Cloudinary URL
    photoPublicId: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number },
    ip: { type: String, default: '' },
    address: { type: String, default: '' },
    device: { type: String, default: '' },        // "Mobile - Android", "Desktop - Windows"
    userAgent: { type: String, default: '' },
    withinGeofence: { type: Boolean, default: true },
    faceDetected: { type: Boolean, default: true },
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    date: { type: String, required: true },       // "2025-01-15" (YYYY-MM-DD)
    clockIn: captureSchema,
    clockOut: captureSchema,
    status: {
        type: String,
        enum: ['present', 'late', 'absent', 'pending', 'half-day', 'leave'],
        default: 'pending',
    },
    totalHours: { type: Number, default: 0 },     // decimal hours
    workLocation: { type: String, default: 'office' }, // office | remote | field
    notes: { type: String, default: '' },
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ 'clockIn.ip': 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
