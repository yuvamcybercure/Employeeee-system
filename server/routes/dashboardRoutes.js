const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');
const Holiday = require('../models/Holiday');

router.use(protect);

// GET /api/dashboard/employee-stats
router.get('/employee-stats', async (req, res) => {
    try {
        if (!req.user || (!req.user.organizationId && req.user.role !== 'master-admin')) {
            console.error('Dashboard Stats Error: req.user or organizationId is missing');
            return res.status(401).json({ message: 'User or Organization data missing' });
        }

        const userId = req.user._id;
        const orgId = req.user.organizationId?._id || req.user.organizationId;

        if (!orgId && req.user.role === 'master-admin') {
            return res.json({
                success: true,
                projectStats: { active: 0, completed: 0, pending: 0, total: 0 },
                birthdays: [],
                holidays: []
            });
        }

        // 1. Project Stats
        let projectStats = { active: 0, completed: 0, pending: 0, total: 0 };
        try {
            const projects = await Project.find({
                organizationId: orgId,
                $or: [
                    { managerId: userId },
                    { teamMembers: userId }
                ]
            });

            projectStats = {
                active: projects.filter(p => p.status === 'active').length,
                completed: projects.filter(p => p.status === 'completed').length,
                pending: projects.filter(p => ['planning', 'on-hold'].includes(p.status)).length,
                total: projects.length
            };
        } catch (projErr) {
            console.error('Dashboard Project Stats Error:', projErr);
        }

        // 2. Upcoming Birthdays (Next 30 days) - Scoped to organization
        let birthdays = [];
        try {
            const users = await User.find({ isActive: true, organizationId: orgId }).select('name profilePhoto joinDate').limit(10);
            birthdays = users.slice(0, 3).map(u => ({
                name: u.name,
                date: "Coming Soon",
                icon: "🎂"
            }));
        } catch (birthErr) {
            console.error('Dashboard Birthday Stats Error:', birthErr);
        }

        // 3. Upcoming Holidays - Scoped to organization
        let holidays = [];
        try {
            const rawHolidays = await Holiday.find({
                organizationId: orgId,
                date: { $gte: new Date() }
            }).sort({ date: 1 }).limit(4);

            holidays = rawHolidays.map(h => ({
                name: h.name,
                date: h.date instanceof Date ? h.date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Invalid Date',
                icon: "🇮🇳"
            }));
        } catch (holErr) {
            console.error('Dashboard Holiday Stats Error:', holErr);
        }

        res.json({
            success: true,
            projectStats,
            birthdays,
            holidays
        });
    } catch (err) {
        console.error('Core Dashboard Stats Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
