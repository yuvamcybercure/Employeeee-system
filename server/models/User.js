const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['superadmin', 'admin', 'employee'], default: 'employee' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    employeeId: { type: String, unique: true, sparse: true },
    phone: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    plainPassword: { type: String }, // Store for Admin/Superadmin visibility
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Detailed Profile
    fatherName: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    dob: { type: Date },
    nationality: { type: String, default: 'Indian' },
    religion: { type: String, default: '' },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed', ''], default: '' },
    address: { type: String, default: '' },

    emergencyContact: {
        name: { type: String, default: '' },
        relationship: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
    },

    documents: [{
        type: { type: String, required: true }, // e.g., 'pan_front', 'aadhaar_front', '10th_certificate'
        name: { type: String, required: true }, // display name or file name
        url: { type: String, required: true },
        version: { type: Number, default: 1 },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' }
    }],

    // Overridden permissions for this specific user
    permissionOverrides: {
        canViewPayroll: { type: Boolean, default: null },
        canEditAttendance: { type: Boolean, default: null },
        canApproveLeave: { type: Boolean, default: null },
        canViewReports: { type: Boolean, default: null },
        canExportData: { type: Boolean, default: null },
        canManageProjects: { type: Boolean, default: null },
        canManagePolicies: { type: Boolean, default: null },
        canManageAssets: { type: Boolean, default: null },
    },
    leaveEntitlements: {
        sick: { yearly: { type: Number, default: 12 }, monthly: { type: Number, default: 1 } },
        casual: { yearly: { type: Number, default: 12 }, monthly: { type: Number, default: 1 } },
        wfh: { yearly: { type: Number, default: 24 }, monthly: { type: Number, default: 2 } },
        unpaid: { yearly: { type: Number, default: 365 }, monthly: { type: Number, default: 31 } },
    },
    lastLogin: { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
