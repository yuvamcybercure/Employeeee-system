// SECURITY & PERFORMANCE FIXES APPLIED:
// Fix #3: All catch blocks use next(err) for centralized error handling
// Fix #9: getHistory now supports pagination (page, limit query params)
// Fix #10: GeofenceSettings cached per org with 5-minute TTL

const Attendance = require('../models/Attendance');
const GeofenceSettings = require('../models/GeofenceSettings');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Timesheet = require('../models/Timesheet');
const { uploadBase64 } = require('../config/cloudinary');
const { logActivity } = require('../middleware/logger');
const NodeCache = require('node-cache');

// Fix #10: Geofence cache with 5-minute TTL
const geofenceCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Haversine distance calculation
const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
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

    // Check geofence — Fix #10: using cache
    let withinGeofence = true;
    const orgId = req.user.organizationId?._id || req.user.organizationId;
    if (lat && lng && orgId) {
        const cacheKey = `geofence_${orgId}`;
        let geofence = geofenceCache.get(cacheKey);
        if (geofence === undefined) {
            geofence = await GeofenceSettings.findOne({ organizationId: orgId, isActive: true });
            geofenceCache.set(cacheKey, geofence || null); // Cache null result too
        }
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
exports.clockIn = async (req, res, next) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.status(400).json({ message: 'Must be in an organization context to clock in' });
        }
        const today = new Date().toISOString().split('T')[0];
        const existing = await Attendance.findOne({ userId: req.user._id, date: today, organizationId: orgId });
        if (existing?.clockIn?.time) return res.status(400).json({ message: 'Already clocked in today' });

        const capture = await buildCapture(req.body, req);

        const orgSettings = req.user.organizationId?.settings?.attendanceSettings;
        const officeStartTimeStr = orgSettings?.startTime || '09:00';
        const [startHours, startMinutes] = officeStartTimeStr.split(':').map(Number);

        const now = new Date();
        const lateThreshold = new Date();
        lateThreshold.setHours(startHours, startMinutes + 15, 0, 0);

        let status = capture.withinGeofence ? (now > lateThreshold ? 'late' : 'present') : 'pending';

        const attendance = await Attendance.findOneAndUpdate(
            { userId: req.user._id, date: today, organizationId: orgId },
            { $set: { clockIn: capture, status } },
            { upsert: true, new: true },
        );

        await logActivity(req.user._id, 'CLOCK_IN', 'attendance', { date: today, status }, req, attendance._id, 'Attendance');
        res.json({ success: true, attendance, withinGeofence: capture.withinGeofence });
    } catch (err) {
        next(err);
    }
};

// POST /api/attendance/clock-out
exports.clockOut = async (req, res, next) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ userId: req.user._id, date: today, organizationId: orgId });

        if (!attendance || !attendance.clockIn || !attendance.clockIn.time) {
            return res.status(400).json({ message: 'You have not clocked in today' });
        }

        if (attendance.clockOut && attendance.clockOut.time) {
            return res.status(400).json({ message: 'Already clocked out today' });
        }

        const capture = await buildCapture(req.body, req);

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
        next(err);
    }
};

// GET /api/attendance/today
exports.getTodayAttendance = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({ userId: req.user._id, date: today });
        res.json({ success: true, attendance });
    } catch (err) {
        next(err);
    }
};

// GET /api/attendance/history?userId=&month=&year=&page=&limit=
exports.getHistory = async (req, res, next) => {
    try {
        if (!req.user || (!req.user.organizationId && req.user.role !== 'master-admin')) {
            return res.status(401).json({ message: 'User or Organization data missing' });
        }

        const userId = req.query.userId || (req.user.role === 'employee' ? req.user._id : null);

        if (userId && String(userId) !== String(req.user._id) && !['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { month, year, page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const orgId = req.user.organizationId?._id || req.user.organizationId;
        let query = { organizationId: orgId };

        if (userId) query.userId = userId;

        if (month && year) {
            const pad = String(month).padStart(2, '0');
            query.date = { $regex: `^${year}-${pad}-` };
        }

        const [records, total] = await Promise.all([
            Attendance.find(query)
                .populate('userId', 'name employeeId profilePhoto')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limitNum),
            Attendance.countDocuments(query)
        ]);

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
            enrichedRecords = records.map(r => r.toObject());
        }

        // Fix #9: Return pagination metadata
        res.json({
            success: true,
            records: enrichedRecords,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/attendance/overview?month=&year=&userId=
exports.getOverview = async (req, res, next) => {
    try {
        const { month, year, userId } = req.query;
        const now = new Date();
        const targetMonth = month || (now.getMonth() + 1);
        const targetYear = year || now.getFullYear();
        const pad = String(targetMonth).padStart(2, '0');
        const datePrefix = `${targetYear}-${pad}-`;

        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
        const orgId = req.user.organizationId?._id || req.user.organizationId;

        if (!orgId && req.user.role === 'master-admin') {
            return res.json({
                success: true,
                records: [],
                stats: { present: 0, absent: 0, late: 0, leaves: 0, totalDays: 30 },
                ipConflicts: []
            });
        }

        if (!orgId) {
            return res.status(400).json({ message: 'Organization data not found for your account' });
        }

        let query = { date: { $regex: `^${datePrefix}` }, organizationId: orgId };

        if (isAdmin) {
            if (userId) query.userId = userId;
        } else {
            query.userId = req.user._id;
        }

        const records = await Attendance.find(query).populate('userId', 'name department profilePhoto employeeId');

        const totalEmployees = (isAdmin && !userId) ? await User.countDocuments({ role: 'employee', isActive: true, organizationId: orgId }) : 1;

        let presentCount = 0;
        let lateCount = 0;

        if (isAdmin && !userId) {
            const presentSet = new Set();
            lateCount = records.filter(r => r.status === 'late').length;
            records.forEach(r => {
                if (['present', 'late'].includes(r.status) && r.userId?._id) {
                    presentSet.add(String(r.userId._id));
                }
            });
            presentCount = presentSet.size;
        } else {
            presentCount = records.filter(r => ['present', 'late'].includes(r.status)).length;
            lateCount = records.filter(r => r.status === 'late').length;
        }

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
        if (userId) {
            leaveQuery.userId = userId;
        } else if (!isAdmin) {
            leaveQuery.userId = req.user._id;
        }

        const leaves = await Leave.find(leaveQuery);
        const totalLeavesCount = leaves.reduce((acc, curr) => acc + (curr.totalDays || 0), 0);

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
            records: isAdmin ? records : [],
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
        next(err);
    }
};

// GET /api/attendance/weekly-summary
exports.getWeeklySummary = async (req, res, next) => {
    try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, data: days.map(date => ({ date, total: 0, present: 0, percentage: 0 })) });
        }
        const results = await Promise.all(days.map(async (date) => {
            const total = await Attendance.countDocuments({ date, organizationId: orgId });
            const present = await Attendance.countDocuments({ date, status: { $in: ['present', 'late'] }, organizationId: orgId });
            return { date, total, present, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
        }));

        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/attendance/:id/approve
exports.approveAttendance = async (req, res, next) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const att = await Attendance.findOneAndUpdate(
            { _id: req.params.id, organizationId: orgId },
            { status: 'present' },
            { new: true }
        );
        if (!att) return res.status(404).json({ message: 'Record not found' });
        await logActivity(req.user._id, 'APPROVE_ATTENDANCE', 'attendance', {}, req, att._id, 'Attendance');
        res.json({ success: true, attendance: att });
    } catch (err) {
        next(err);
    }
};
