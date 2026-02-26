const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    type: { type: String, enum: ['payroll', 'expense', 'invoice_payment'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['razorpay', 'bank-transfer', 'cash', 'upi'], required: true },
    razorpayId: {
        orderId: String,
        paymentId: String,
        signature: String
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // link to Payroll, Expense, or Invoice
    payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String },
    metadata: { type: Map, of: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
