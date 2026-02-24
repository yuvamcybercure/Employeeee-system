const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Organization = require('../models/Organization');

const initAttendanceCron = () => {
    // 1. Auto Logout - Runs every hour
    cron.schedule('0 * * * *', async () => {
        console.log('--- Running Auto-Logout Cron ---');
        try {
            const today = new Date().toISOString().split('T')[0];
            const currentHour = new Date().getHours();

            const orgs = await Organization.find({ 'settings.attendanceSettings.isActive': true });

            for (const org of orgs) {
                const settings = org.settings.attendanceSettings;
                const [endHours] = settings.endTime.split(':').map(Number);
                const logoutHour = endHours + settings.autoLogoutOffset;

                if (currentHour >= logoutHour) {
                    // Find users who clocked in but haven't clocked out
                    const activeRecords = await Attendance.find({
                        organizationId: org._id,
                        date: today,
                        'clockIn.time': { $exists: true },
                        clockOut: { $exists: false }
                    });

                    for (const record of activeRecords) {
                        const clockInTime = new Date(record.clockIn.time);
                        const autoClockOutTime = new Date();
                        autoClockOutTime.setHours(logoutHour, 0, 0, 0);

                        const totalHours = Math.max(0, (autoClockOutTime - clockInTime) / 3600000);

                        await Attendance.findByIdAndUpdate(record._id, {
                            $set: {
                                clockOut: {
                                    time: autoClockOutTime,
                                    remark: 'system auto logout',
                                    device: 'System'
                                },
                                totalHours: parseFloat(totalHours.toFixed(2)),
                                notes: (record.notes ? record.notes + ' ' : '') + '[System Auto Logout]'
                            }
                        });
                        console.log(`Auto-logged out user ${record.userId} for org ${org.name}`);
                    }
                }
            }
        } catch (err) {
            console.error('Auto-Logout Cron Error:', err);
        }
    });

    // 2. Auto Absent - Runs at 11:55 PM every day
    cron.schedule('55 23 * * *', async () => {
        console.log('--- Running Auto-Absent Cron ---');
        try {
            const today = new Date().toISOString().split('T')[0];
            const orgs = await Organization.find({ 'settings.attendanceSettings.isActive': true });

            for (const org of orgs) {
                const activeEmployees = await User.find({
                    organizationId: org._id,
                    role: 'employee',
                    isActive: true
                });

                for (const employee of activeEmployees) {
                    const existing = await Attendance.findOne({
                        userId: employee._id,
                        date: today,
                        organizationId: org._id
                    });

                    if (!existing) {
                        await Attendance.create({
                            userId: employee._id,
                            organizationId: org._id,
                            date: today,
                            status: 'absent',
                            notes: 'System marked absent: No clock-in detected'
                        });
                        console.log(`Marked user ${employee.name} absent for org ${org.name}`);
                    }
                }
            }
        } catch (err) {
            console.error('Auto-Absent Cron Error:', err);
        }
    });

    console.log('🚀 Attendance Cron Service Initialized');
};

module.exports = initAttendanceCron;
