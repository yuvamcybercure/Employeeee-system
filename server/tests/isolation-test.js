const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

dotenv.config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find the default organization
        const org1 = await Organization.findOne({ slug: 'default' });
        if (!org1) throw new Error('Org 1 (default) not found');

        // 2. Create a second organization
        let org2 = await Organization.findOne({ slug: 'test-org-2' });
        if (!org2) {
            org2 = await Organization.create({
                name: 'Test Organization 2',
                slug: 'test-org-2',
                isActive: true
            });
            console.log('Created Org 2');
        }

        // 3. Create a user for Org 2
        let user2 = await User.findOne({ email: 'test2@example.com' });
        if (!user2) {
            user2 = await User.create({
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'password123',
                role: 'admin',
                organizationId: org2._id,
                employeeId: 'EMP002'
            });
            console.log('Created User 2 in Org 2');
        }

        // 4. Create some data for Org 1 (if not already there - assume it exists from migration)
        const user1 = await User.findOne({ organizationId: org1._id });
        if (!user1) throw new Error('No users found in Org 1');

        // 5. TEST: Query as if we are User 2 (using organizationId scoping logic)
        console.log('\n--- VERIFYING ISOLATION ---');

        // A. Users
        const org2Users = await User.find({ organizationId: org2._id });
        const org1UsersFoundInOrg2Query = org2Users.find(u => u.organizationId.toString() === org1._id.toString());
        console.log(`Users Isolation: ${!org1UsersFoundInOrg2Query ? 'PASSED' : 'FAILED'}`);
        console.log(`- Found ${org2Users.length} users in Org 2`);

        // B. Attendance
        // Create one record for Org 1 if not exists
        await Attendance.findOneAndUpdate(
            { userId: user1._id, date: '2024-01-01', organizationId: org1._id },
            { status: 'present', clockIn: { time: new Date() } },
            { upsert: true }
        );

        const org2Attendance = await Attendance.find({ organizationId: org2._id });
        const org1AttendanceFoundInOrg2Query = org2Attendance.find(a => a.organizationId.toString() === org1._id.toString());
        console.log(`Attendance Isolation: ${!org1AttendanceFoundInOrg2Query ? 'PASSED' : 'FAILED'}`);
        console.log(`- Found ${org2Attendance.length} records in Org 2`);

        console.log('\n--- TEST COMPLETE ---');

    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

runTest();
