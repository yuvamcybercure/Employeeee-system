require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fixTypo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'yuvamk6@gmai.com' });
        if (user) {
            user.email = 'yuvamk6@gmail.com';
            await user.save();
            console.log('✅ Fixed typo: yuvamk6@gmail.com');
        }
    } catch (err) {
        console.error('Fix failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

fixTypo();
