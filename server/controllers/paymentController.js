const Transaction = require('../models/Transaction');
const Payroll = require('../models/Payroll');
const Invoice = require('../models/Invoice');

// This would typically involve a Razorpay SDK
// For now, implementing the flow

exports.createOrder = async (req, res) => {
    try {
        const { amount, type, referenceId } = req.body;
        // In real app: const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR" });

        const transaction = await Transaction.create({
            organizationId: req.user.organizationId,
            type,
            amount,
            referenceId,
            paymentMethod: 'razorpay',
            status: 'pending',
            payerId: req.user._id
        });

        res.json({ success: true, orderId: `order_${Date.now()}`, transactionId: transaction._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { transactionId, razorpayPaymentId, razorpaySignature } = req.body;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Verify signature here...

        transaction.status = 'completed';
        transaction.razorpayId = {
            paymentId: razorpayPaymentId,
            signature: razorpaySignature
        };
        await transaction.save();

        // Update linked record
        if (transaction.type === 'payroll') {
            await Payroll.findByIdAndUpdate(transaction.referenceId, { status: 'paid', paymentDate: new Date(), transactionId: razorpayPaymentId });
        } else if (transaction.type === 'invoice_payment') {
            await Invoice.findByIdAndUpdate(transaction.referenceId, { status: 'paid', balanceDue: 0 });
        }

        res.json({ success: true, message: 'Payment verified and recorded' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
