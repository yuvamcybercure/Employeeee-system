const Attendance = require('../models/Attendance');
const GeofenceSettings = require('../models/GeofenceSettings');
const { uploadBase64 } = require('../config/cloudinary');
const { logActivity } = require('../middleware/logger');

// Calculate distance in meters between two lat/lng points (Haversine)
const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (val) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildCapture = async (data, req) => {
    const { photo, lat, lng, device, faceDetected } = data;
    let photoUrl = '';
    let photoPublicId = '';

    if (photo && photo.startsWith('data:image')) {
        const result = await uploadBase64(photo);
        photoUrl = result.url;
        photoPublicId = result.publicId;
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';

    // Check geofence
    let withinGeofence = true;
    const geofence = await GeofenceSettings.findOne({ isActive: true });
    if (geofence && lat && lng) {
        const dist = getDistance(parseFloat(lat), parseFloat(lng), geofence.lat, geofence.lng);
        withinGeofence = dist <= geofence.radiusMeters;
    }

    return {
        time: new Date(),
        photo: photoUrl,
        photoPublicId,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        ip,
        device: device || 'Unknown',
        userAgent: req.headers['user-agent'] || '',
        withinGeofence,
        faceDetected: faceDetected !== false,
    };
};

// POST /api/attendance/clock-in
exports.clockIn = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const existing = await Attendance.findOne({ userId: req.user._id, date: today });
        if (existing?.clockIn?.time) return res.status(400).json({ message: 'Already clocked in today' });

        const capture = await buildCapture(req.body, req);

        // Determine status
        const now = new Date();
        const lateThreshold = new Date();
        lateThreshold.setHours(9, 30, 0, 0); // Late after 9:30 AM
        let status = capture.withinGeofence ? (now > lateThreshold ? 'late' : 'present') : 'pending';

        const attendance = await Attendance.findOneAndUpdate(
            { userId: req.user._id, date: today },
            { $set: { clockIn: capture, status } },
            { upsert: true, new: true },
        );

        await logActivity(req.user._id, 'CLOCK_IN', 'attendance', { date: today, status }, req, attendance._id, 'Attendance');
        res.json({ success: true, attendance, withinGeofence: capture.withinGeofence });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/attendance/clock-out
exports.clockOut = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ userId: req.user._id, date: today });
        if (!attendance?.clockIn?.time) return res.status(400).json({ message: 'You have not clocked in today' });
        if (attendance.clockOut?.time) return res.status(400).json({ message: 'Already clocked out today' });

        const capture = await buildCapture(req.body, req);

        // Calculate total hours
        const totalHours = (new Date() - attendance.clockIn.time) / 3600000;

        const updated = await Attendance.findOneAndUpdate(
            { _id: attendance._id },
            { $set: { clockOut: capture, totalHours: parseFloat(totalHours.toFixed(2)) } },
            { new: true },
        );

        await logActivity(req.user._id, 'CLOCK_OUT', 'attendance', { date: today, totalHours }, req, attendance._id, 'Attendance');
        res.json({ success: true, attendance: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/today
exports.getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ userId: req.user._id, date: today });
        res.json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/history?userId=&month=&year=
exports.getHistory = async (req, res) => {
    try {
        const userId = req.query.userId || req.user._id;
        // Only admins/superadmins can query other users
        if (String(userId) !== String(req.user._id) && !['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { month, year } = req.query;
        let filter = { userId };
        if (month && year) {
            const pad = String(month).padStart(2, '0');
            filter.date = { $gte: `${year}-${pad}-01`, $lte: `${year}-${pad}-31` };
        }
        const records = await Attendance.find(filter).sort({ date: -1 });
        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/overview  (Admin/Superadmin)
exports.getOverview = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const records = await Attendance.find({ date: today }).populate('userId', 'name department profilePhoto');

        // Detect IP conflicts
        const ipMap = {};
        records.forEach(r => {
            if (r.clockIn?.ip) {
                if (!ipMap[r.clockIn.ip]) ipMap[r.clockIn.ip] = [];
                ipMap[r.clockIn.ip].push({ userId: r.userId, attendanceId: r._id });
            }
        });
        const ipConflicts = Object.entries(ipMap)
            .filter(([, users]) => users.length > 1)
            .map(([ip, users]) => ({ ip, users }));

        const present = records.filter(r => ['present', 'late'].includes(r.status));
        const late = records.filter(r => r.status === 'late');
        const pending = records.filter(r => r.status === 'pending');

        // Active map locations (clocked in, not yet out)
        const activeLocations = records
            .filter(r => r.clockIn?.lat && !r.clockOut?.time)
            .map(r => ({ userId: r.userId, lat: r.clockIn.lat, lng: r.clockIn.lng, time: r.clockIn.time }));

        res.json({ success: true, records, present: present.length, late: late.length, pending: pending.length, total: records.length, ipConflicts, activeLocations });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/weekly-summary  (chart data)
exports.getWeeklySummary = async (req, res) => {
    try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        const results = await Promise.all(days.map(async (date) => {
            const total = await Attendance.countDocuments({ date });
            const present = await Attendance.countDocuments({ date, status: { $in: ['present', 'late'] } });
            return { date, total, present, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
        }));

        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/attendance/:id/approve  (Admin approves pending)
exports.approveAttendance = async (req, res) => {
    try {
        const att = await Attendance.findByIdAndUpdate(req.params.id, { status: 'present' }, { new: true });
        if (!att) return res.status(404).json({ message: 'Record not found' });
        await logActivity(req.user._id, 'APPROVE_ATTENDANCE', 'attendance', {}, req, att._id, 'Attendance');
        res.json({ success: true, attendance: att });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
