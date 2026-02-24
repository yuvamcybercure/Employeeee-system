require('dotenv').config();
const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');

const checkLogs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- Recent Activity Logs ---');
        const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(20).populate('userId', 'email');
        logs.forEach(l => {
            console.log(`[${l.createdAt.toISOString()}] ${l.action} - ${l.userId?.email || 'SYSTEM'}: ${JSON.stringify(l.details)}`);
        });

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

checkLogs();
