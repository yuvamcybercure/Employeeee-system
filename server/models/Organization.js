const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String }, // Changed from default: ''
    isActive: { type: Boolean, default: true },
    subscription: {
        plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
        expiresAt: { type: Date }
    },
    address: { type: String, default: '' },
    contact: {
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        website: { type: String, default: '' }
    },
    taxInfo: {
        gstin: { type: String, default: '' },
        pan: { type: String, default: '' },
        taxRate: { type: Number, default: 0 } // Default GST %
    },
    currency: { type: String, default: 'INR' },
    settings: {
        allowedDomains: [{ type: String }],
        branding: {
            primaryColor: { type: String, default: '#6366f1' }, // Default primary
            secondaryColor: { type: String, default: '#4f46e5' }
        },
        attendanceSettings: {
            startTime: { type: String, default: '09:00' }, // HH:mm
            endTime: { type: String, default: '18:00' },   // HH:mm
            autoLogoutOffset: { type: Number, default: 2 }, // Hours after endTime
            absentMarkingTime: { type: String, default: '23:55' }, // When to mark absent
            isActive: { type: Boolean, default: true }
        },
        defaultLeaveEntitlements: {
            sick: { yearly: { type: Number, default: 12 }, monthly: { type: Number, default: 1 } },
            casual: { yearly: { type: Number, default: 12 }, monthly: { type: Number, default: 1 } },
            wfh: { yearly: { type: Number, default: 24 }, monthly: { type: Number, default: 2 } },
            unpaid: { yearly: { type: Number, default: 365 }, monthly: { type: Number, default: 31 } }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
