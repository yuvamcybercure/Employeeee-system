require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const setSuperadmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'yuvamk6@gmail.com';
        let user = await User.findOne({ email });

        if (!user) {
            // Check if there's an existing superadmin to update or just create new
            user = await User.findOne({ role: 'superadmin' }) || new User();
        }

        user.name = 'Yuvam Superadmin';
        user.email = email;
        user.password = 'yuvam123';
        // SECURITY: plainPassword removed
        user.role = 'superadmin';
        user.isActive = true;

        await user.save();
        console.log('✅ Superadmin updated to:');
        console.log(`Email: ${email}`);
        console.log('Password: yuvam123');
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

setSuperadmin();
