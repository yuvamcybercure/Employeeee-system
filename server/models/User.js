const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
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
