// SECURITY FIX: plainPassword references removed
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const email = 'masteradmink6@gmail.com';
const password = 'master @123';

async function setupMaster() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ems';
        console.log('Connecting to:', uri.split('@').pop());

        await mongoose.connect(uri);

        let user = await User.findOne({ email });
        if (user) {
            user.role = 'master-admin';
            user.password = password;
            user.organizationId = undefined;
            await user.save();
            console.log('Successfully updated existing user to Master Admin');
        } else {
            user = await User.create({
                name: 'Master Admin',
                email,
                password,
                role: 'master-admin',
                isActive: true
            });
            console.log('Successfully created new Master Admin account');
        }
        process.exit(0);
    } catch (err) {
        console.error('Setup failed:', err);
        process.exit(1);
    }
}

setupMaster();
