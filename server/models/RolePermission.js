const mongoose = require('mongoose');

// Stores the permission matrix for each role
const rolePermissionSchema = new mongoose.Schema({
    role: { type: String, enum: ['admin', 'employee'], required: true, unique: true },
    permissions: {
        canViewPayroll: { type: Boolean, default: false },
        canEditAttendance: { type: Boolean, default: false },
        canApproveLeave: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: false },
        canExportData: { type: Boolean, default: false },
        canManageProjects: { type: Boolean, default: false },
        canManagePolicies: { type: Boolean, default: false },
        canManageAssets: { type: Boolean, default: false },
        canSendMessages: { type: Boolean, default: true },
        canViewSuggestions: { type: Boolean, default: true },
    },
}, { timestamps: true });

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
