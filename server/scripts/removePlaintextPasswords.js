// One-time migration script: Remove plainPassword field from ALL users in the database
// Run: node scripts/removePlaintextPasswords.js
// SECURITY FIX: Plaintext passwords must never be stored.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function migrate() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ems';
        console.log('Connecting to database...');
        await mongoose.connect(uri);

        // Remove plainPassword field from ALL user documents
        const result = await mongoose.connection.collection('users').updateMany(
            { plainPassword: { $exists: true } },
            { $unset: { plainPassword: '' } }
        );

        console.log(`✅ Migration complete. Modified ${result.modifiedCount} documents.`);
        console.log('   All plainPassword fields have been permanently removed.');

        // Also clean up PasswordResetRequests that might have unhashed passwords
        const resetResult = await mongoose.connection.collection('passwordresetrequests').updateMany(
            {},
            { $unset: { newPassword: '' } }
        );
        console.log(`✅ Cleaned ${resetResult.modifiedCount} password reset request documents.`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
