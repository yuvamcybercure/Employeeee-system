const mongoose = require('mongoose');

// Stores the permission matrix for each role
const rolePermissionSchema = new mongoose.Schema({
    role: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    permissions: {
        // Finance
        canViewFinanceDashboard: { type: Boolean, default: false },
        canManageExpenses: { type: Boolean, default: false },
        canManageInvoices: { type: Boolean, default: false },
        canConfigureRates: { type: Boolean, default: false },
        canConfigureCompensation: { type: Boolean, default: false },

        // Payroll
        canViewPayroll: { type: Boolean, default: false },
        canGeneratePayroll: { type: Boolean, default: false },
        canDisbursePayroll: { type: Boolean, default: false },

        // Attendance & HR
        canViewAttendance: { type: Boolean, default: false },
        canEditAttendance: { type: Boolean, default: false },
        canApproveLeave: { type: Boolean, default: false },
        canConfigureGeofence: { type: Boolean, default: false },

        // Assets
        canViewAssets: { type: Boolean, default: false },
        canManageAssets: { type: Boolean, default: false },

        // Project Management
        canManageProjects: { type: Boolean, default: false },
        canViewProjectStats: { type: Boolean, default: false },

        // User Management
        canViewEmployees: { type: Boolean, default: false },
        canAddEmployee: { type: Boolean, default: false },
        canEditEmployee: { type: Boolean, default: false },
        canManagePermissions: { type: Boolean, default: false },

        // Misc
        canManagePolicies: { type: Boolean, default: false },
        canSendBroadcast: { type: Boolean, default: false },
        canViewSuggestions: { type: Boolean, default: true },
        canSendMessages: { type: Boolean, default: true },
    },
}, { timestamps: true });

rolePermissionSchema.index({ role: 1, organizationId: 1 }, { unique: true });

module.exports = mongoose.model('RolePermission', rolePermissionSchema);
