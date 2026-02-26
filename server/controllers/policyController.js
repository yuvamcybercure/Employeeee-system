const Policy = require('../models/Policy');
const { logActivity } = require('../middleware/logger');

// GET /api/policies
exports.getPolicies = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.json({ success: true, policies: [] });
        }
        const filter = { status: 'active', organizationId: orgId };
        if (['admin', 'superadmin'].includes(req.user.role)) delete filter.status;
        const policies = await Policy.find(filter).sort({ effectiveDate: -1 });
        res.json({ success: true, policies });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/policies (Superadmin only)
exports.createPolicy = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role === 'master-admin') {
            return res.status(400).json({ message: 'Must be in an organization context to create policy' });
        }
        const policy = await Policy.create({
            ...req.body,
            organizationId: orgId,
            createdBy: req.user._id
        });
        await logActivity(req.user._id, 'CREATE_POLICY', 'policies', { title: policy.title }, req, policy._id, 'Policy');
        res.status(201).json({ success: true, policy });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/policies/:id/acknowledge
exports.acknowledgePolicy = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const policy = await Policy.findOne({ _id: req.params.id, organizationId: orgId });
        if (!policy) return res.status(404).json({ message: 'Policy not found' });
        const existing = policy.acknowledgedBy.find(a => String(a.userId) === String(req.user._id));
        if (!existing) {
            policy.acknowledgedBy.push({ userId: req.user._id, acknowledgedAt: new Date() });
            await policy.save();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
