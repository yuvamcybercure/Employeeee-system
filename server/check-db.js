require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Organization = require('./models/Organization');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- Organizations ---');
        const orgs = await Organization.find();
        orgs.forEach(o => console.log(`ID: ${o._id}, Name: ${o.name}, Slug: ${o.slug}`));

        console.log('--- Users ---');
        const users = await User.find().populate('organizationId', 'name');
        users.forEach(u => console.log(`Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, Org: ${u.organizationId?.name || 'NONE'}`));

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        mongoose.connection.close();
    }
};

checkDB();
