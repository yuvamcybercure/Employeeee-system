require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createSuperadmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for Superadmin creation...');

        const email = 'superadmin@taskease.com';
        const exists = await User.findOne({ email });

        if (exists) {
            console.log('Superadmin user already exists.');
        } else {
            await User.create({
                name: 'System Administrator',
                email,
                password: 'adminPassword123',
                role: 'superadmin',
                department: 'Management',
                isActive: true
            });
            console.log('✅ Superadmin created successfully!');
            console.log('Email: superadmin@taskease.com');
            console.log('Password: adminPassword123');
        }
    } catch (err) {
        console.error('Error creating superadmin:', err);
    } finally {
        mongoose.connection.close();
    }
};

createSuperadmin();
