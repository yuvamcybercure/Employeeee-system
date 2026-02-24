const Attendance = require('../models/Attendance');
const GeofenceSettings = require('../models/GeofenceSettings');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Timesheet = require('../models/Timesheet');
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
    const { photo, lat, lng, device, faceDetected, address } = data;
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
    if (lat && lng && req.user?.organizationId?._id) {
        const geofence = await GeofenceSettings.findOne({ organizationId: req.user.organizationId._id, isActive: true });
        if (geofence) {
            const dist = getDistance(parseFloat(lat), parseFloat(lng), geofence.lat, geofence.lng);
            withinGeofence = dist <= geofence.radiusMeters;
        }
    }

    return {
        time: new Date(),
        photo: photoUrl,
        photoPublicId,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        address: address || '',
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
        const existing = await Attendance.findOne({ userId: req.user._id, date: today, organizationId: req.user.organizationId._id });
        if (existing?.clockIn?.time) return res.status(400).json({ message: 'Already clocked in today' });

        const capture = await buildCapture(req.body, req);

        // Determine status dynamically from organization settings
        const orgSettings = req.user.organizationId?.settings?.attendanceSettings;
        const officeStartTimeStr = orgSettings?.startTime || '09:00';
        const [startHours, startMinutes] = officeStartTimeStr.split(':').map(Number);

        const now = new Date();
        const lateThreshold = new Date();
        lateThreshold.setHours(startHours, startMinutes + 15, 0, 0); // Grace period: 15 mins after startTime

        let status = capture.withinGeofence ? (now > lateThreshold ? 'late' : 'present') : 'pending';

        const attendance = await Attendance.findOneAndUpdate(
            { userId: req.user._id, date: today, organizationId: req.user.organizationId._id },
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
        const attendance = await Attendance.findOne({ userId: req.user._id, date: today, organizationId: req.user.organizationId._id });

        if (!attendance || !attendance.clockIn || !attendance.clockIn.time) {
            return res.status(400).json({ message: 'You have not clocked in today' });
        }

        if (attendance.clockOut && attendance.clockOut.time) {
            return res.status(400).json({ message: 'Already clocked out today' });
        }

        const capture = await buildCapture(req.body, req);

        // Calculate total hours robustly
        const clockInTime = new Date(attendance.clockIn.time);
        const clockOutTime = new Date();
        const totalHours = Math.max(0, (clockOutTime - clockInTime) / 3600000);

        const updated = await Attendance.findOneAndUpdate(
            { _id: attendance._id },
            { $set: { clockOut: capture, totalHours: parseFloat(totalHours.toFixed(2)) } },
            { new: true },
        );

        await logActivity(req.user._id, 'CLOCK_OUT', 'attendance', { date: today, totalHours: parseFloat(totalHours.toFixed(2)) }, req, attendance._id, 'Attendance');
        res.json({ success: true, attendance: updated });
    } catch (err) {
        console.error('Clock-out Error:', err);
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
        if (!req.user || !req.user.organizationId) {
            return res.status(401).json({ message: 'User or Organization data missing' });
        }

        const userId = req.query.userId || (req.user.role === 'employee' ? req.user._id : null);

        // If not admin/superadmin, can only view own history
        if (userId && String(userId) !== String(req.user._id) && !['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { month, year } = req.query;
        let query = { organizationId: req.user.organizationId._id };

        if (userId) query.userId = userId;

        if (month && year) {
            const pad = String(month).padStart(2, '0');
            query.date = { $regex: `^${year}-${pad}-` };
        }

        let records = await Attendance.find(query)
            .populate('userId', 'name employeeId profilePhoto')
            .sort({ date: -1 });

        // Safely merge timesheet hours
        let enrichedRecords = [];
        try {
            const timesheetQuery = { ...query };
            const timesheets = await Timesheet.find(timesheetQuery);
            const timesheetMap = {};

            timesheets.forEach(ts => {
                const key = `${ts.userId}_${ts.date}`;
                timesheetMap[key] = (timesheetMap[key] || 0) + ts.hoursWorked;
            });

            enrichedRecords = records.map(r => {
                const obj = r.toObject();
                if (r.userId && r.userId._id) {
                    const tsKey = `${r.userId._id}_${r.date}`;
                    obj.timesheetHours = timesheetMap[tsKey] || 0;
                } else {
                    obj.timesheetHours = 0;
                }
                return obj;
            });

            // Detect Sundays if filtering by month/year and a single user
            if (month && year && userId) {
                const daysInMonth = new Date(year, month, 0).getDate();
                const existingDates = new Set(enrichedRecords.map(r => r.date));

                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dateObj = new Date(year, month - 1, day);

                    if (dateObj.getDay() === 0 && !existingDates.has(dateStr)) {
                        enrichedRecords.push({
                            date: dateStr,
                            status: 'Sunday',
                            isVirtual: true,
                            userId: records[0]?.userId || req.user._id
                        });
                    }
                }
                enrichedRecords.sort((a, b) => b.date.localeCompare(a.date));
            }
        } catch (enrichErr) {
            console.error('Attendance Enrichment Error:', enrichErr);
            // Fallback to basic records if enrichment fails
            enrichedRecords = records.map(r => r.toObject());
        }

        res.json({ success: true, records: enrichedRecords });
    } catch (err) {
        console.error('Get History Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/overview?month=&year=
exports.getOverview = async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const targetMonth = month || (now.getMonth() + 1);
        const targetYear = year || now.getFullYear();
        const pad = String(targetMonth).padStart(2, '0');
        const datePrefix = `${targetYear}-${pad}-`;

        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

        let query = { date: { $regex: `^${datePrefix}` }, organizationId: req.user.organizationId._id };
        if (!isAdmin) query.userId = req.user._id;

        const records = await Attendance.find(query).populate('userId', 'name department profilePhoto employeeId');

        // Total employees count (for Admin only)
        const totalEmployees = isAdmin ? await User.countDocuments({ role: 'employee', isActive: true, organizationId: req.user.organizationId._id }) : 1;

        // Stats calculation
        let presentCount = 0;
        let lateCount = 0;

        if (isAdmin) {
            const presentSet = new Set();
            lateCount = records.filter(r => r.status === 'late').length;
            records.forEach(r => {
                if (['present', 'late'].includes(r.status)) presentSet.add(String(r.userId._id));
            });
            presentCount = presentSet.size;
        } else {
            // Personal stats for employee
            presentCount = records.filter(r => ['present', 'late'].includes(r.status)).length;
            lateCount = records.filter(r => r.status === 'late').length;
        }

        // Leave days in this month
        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        let leaveQuery = {
            status: 'approved',
            $or: [
                { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
                { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
                { $and: [{ startDate: { $lte: startOfMonth } }, { endDate: { $gte: endOfMonth } }] }
            ]
        };
        if (!isAdmin) leaveQuery.userId = req.user._id;

        const leaves = await Leave.find(leaveQuery);
        const totalLeavesCount = leaves.reduce((acc, curr) => acc + (curr.totalDays || 0), 0);

        // Days in month
        const totalDays = new Date(targetYear, targetMonth, 0).getDate();

        // Detect IP conflicts (Today only - Admin only)
        let ipConflicts = [];
        if (isAdmin) {
            const todayStr = now.toISOString().split('T')[0];
            const todayRecords = records.filter(r => r.date === todayStr);
            const ipMap = {};
            todayRecords.forEach(r => {
                if (r.clockIn?.ip) {
                    if (!ipMap[r.clockIn.ip]) ipMap[r.clockIn.ip] = [];
                    ipMap[r.clockIn.ip].push({ userId: r.userId, attendanceId: r._id });
                }
            });
            ipConflicts = Object.entries(ipMap)
                .filter(([, users]) => users.length > 1)
                .map(([ip, users]) => ({ ip, users }));
        }

        res.json({
            success: true,
            records: isAdmin ? records : [], // Employees only need stats, history comes from getHistory
            stats: {
                present: presentCount,
                absent: Math.max(0, (isAdmin ? totalEmployees : totalDays) - presentCount - (isAdmin ? 0 : totalLeavesCount)),
                late: lateCount,
                leaves: totalLeavesCount,
                totalDays
            },
            ipConflicts
        });
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
            const total = await Attendance.countDocuments({ date, organizationId: req.user.organizationId._id });
            const present = await Attendance.countDocuments({ date, status: { $in: ['present', 'late'] }, organizationId: req.user.organizationId._id });
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
        const att = await Attendance.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.user.organizationId._id },
            { status: 'present' },
            { new: true }
        );
        if (!att) return res.status(404).json({ message: 'Record not found' });
        await logActivity(req.user._id, 'APPROVE_ATTENDANCE', 'attendance', {}, req, att._id, 'Attendance');
        res.json({ success: true, attendance: att });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
