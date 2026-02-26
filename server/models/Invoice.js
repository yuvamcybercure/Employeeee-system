const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    invoiceNumber: { type: String, required: true, unique: true },
    client: {
        name: { type: String, required: true },
        email: { type: String },
        address: { type: String },
        gstin: { type: String }
    },
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 18 }, // GST %
    taxAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
    status: { type: String, enum: ['draft', 'sent', 'partially-paid', 'paid', 'void'], default: 'draft' },
    dueDate: { type: Date },
    notes: { type: String },
    terms: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
