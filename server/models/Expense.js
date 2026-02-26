const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ['rent', 'electricity', 'internet', 'software', 'hardware', 'office-supplies', 'marketing', 'travel', 'other'],
        default: 'other'
    },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 }, // GST etc.
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    receiptUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'bank-transfer', 'card', 'upi', 'razorpay'], default: 'cash' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
