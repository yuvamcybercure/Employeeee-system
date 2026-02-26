const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: {
        tds: { type: Number, default: 0 },
        pf: { type: Number, default: 0 },
        esi: { type: Number, default: 0 },
        professionalTax: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    grossSalary: { type: Number, required: true },
    netPayable: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'processed', 'paid'], default: 'draft' },
    paymentDate: { type: Date },
    transactionId: { type: String },
    paySlipUrl: { type: String },
    remarks: { type: String, default: '' }
}, { timestamps: true });

// Ensure unique payroll for user per month
payrollSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
