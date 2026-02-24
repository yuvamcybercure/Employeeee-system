require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'superadmin@taskease.com';
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Superadmin not found!');
            return;
        }
        user.password = 'admin123';
        user.plainPassword = 'admin123';
        await user.save();
        console.log('✅ Password reset to: admin123');
    } catch (err) {
        console.error('Reset failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

resetPassword();
