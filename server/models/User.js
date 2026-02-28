const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: function () { return this.role !== 'master-admin'; } },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['master-admin', 'superadmin', 'admin', 'employee'], default: 'employee' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    employeeId: { type: String, unique: true, sparse: true },
    phone: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    // SECURITY: plainPassword field has been permanently removed. Passwords are bcrypt-hashed only.
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
        // Finance
        canViewFinanceDashboard: { type: Boolean, default: null },
        canManageExpenses: { type: Boolean, default: null },
        canManageInvoices: { type: Boolean, default: null },
        canConfigureRates: { type: Boolean, default: null },
        canConfigureCompensation: { type: Boolean, default: null },

        // Payroll
        canViewPayroll: { type: Boolean, default: null },
        canGeneratePayroll: { type: Boolean, default: null },
        canDisbursePayroll: { type: Boolean, default: null },

        // Attendance & HR
        canViewAttendance: { type: Boolean, default: null },
        canEditAttendance: { type: Boolean, default: null },
        canApproveLeave: { type: Boolean, default: null },
        canConfigureGeofence: { type: Boolean, default: null },

        // Assets
        canViewAssets: { type: Boolean, default: null },
        canManageAssets: { type: Boolean, default: null },

        // Project Management
        canManageProjects: { type: Boolean, default: null },
        canViewProjectStats: { type: Boolean, default: null },

        // User Management
        canViewEmployees: { type: Boolean, default: null },
        canAddEmployee: { type: Boolean, default: null },
        canEditEmployee: { type: Boolean, default: null },
        canManagePermissions: { type: Boolean, default: null },

        // Misc
        canManagePolicies: { type: Boolean, default: null },
        canSendBroadcast: { type: Boolean, default: null },
        canViewSuggestions: { type: Boolean, default: null },
    },
    leaveEntitlements: {
        sick: { yearly: { type: Number, default: 12 }, monthly: { type: Number, default: 1 } },
        casual: { yearly: { type: Number, default: 12 }, monthly: { type: Number, default: 1 } },
        wfh: { yearly: { type: Number, default: 24 }, monthly: { type: Number, default: 2 } },
        unpaid: { yearly: { type: Number, default: 365 }, monthly: { type: Number, default: 31 } },
    },
    bankDetails: {
        accountNo: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        bankName: { type: String, default: '' },
        branch: { type: String, default: '' },
        holderName: { type: String, default: '' },
        address: { type: String, default: '' },
    },
    salaryStructure: {
        baseSalary: { type: Number, default: 0 },
        hourlyRate: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
        pf: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
        tdsPercentage: { type: Number, default: 0 },
        compensationType: { type: String, enum: ['hourly', 'monthly'], default: 'monthly' },
    },
    lastLogin: { type: Date },
    expoPushToken: { type: String, default: null },
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
