const mongoose = require('mongoose');
require('dotenv').config();
const Organization = require('./models/Organization');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Project = require('./models/Project');
const Asset = require('./models/Asset');
const Holiday = require('./models/Holiday');
const Policy = require('./models/Policy');
const Timesheet = require('./models/Timesheet');
const GeofenceSettings = require('./models/GeofenceSettings');
const ActivityLog = require('./models/ActivityLog');
const Message = require('./models/Message');
const Suggestion = require('./models/Suggestion');
const RolePermission = require('./models/RolePermission');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create Default Organization
        let defaultOrg = await Organization.findOne({ slug: 'default' });
        if (!defaultOrg) {
            defaultOrg = await Organization.create({
                name: 'Default Organization',
                slug: 'default'
            });
            console.log('Created Default Organization');
        }

        const orgId = defaultOrg._id;

        // 2. Update Users
        const userResult = await User.updateMany(
            { organizationId: { $exists: false } },
            { $set: { organizationId: orgId } }
        );
        console.log(`Updated ${userResult.nModified || userResult.modifiedCount} users`);

        // 3. Update Other Collections
        const collections = [
            { model: Attendance, name: 'Attendance' },
            { model: Leave, name: 'Leave' },
            { model: Project, name: 'Project' },
            { model: Asset, name: 'Asset' },
            { model: Holiday, name: 'Holiday' },
            { model: Policy, name: 'Policy' },
            { model: Timesheet, name: 'Timesheet' },
            { model: GeofenceSettings, name: 'GeofenceSettings' },
            { model: ActivityLog, name: 'ActivityLog' },
            { model: Message, name: 'Message' },
            { model: Suggestion, name: 'Suggestion' },
            { model: RolePermission, name: 'RolePermission' }
        ];

        for (const col of collections) {
            const res = await col.model.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: orgId } }
            );
            console.log(`Updated ${res.nModified || res.modifiedCount} records in ${col.name}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
