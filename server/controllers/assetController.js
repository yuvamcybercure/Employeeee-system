const Asset = require('../models/Asset');
const AssetIssue = require('../models/AssetIssue');
const { logActivity } = require('../middleware/logger');

// ... (existing asset methods)

// POST /api/assets/issues
exports.reportIssue = async (req, res) => {
    try {
        const { assetId, issueType, priority, description } = req.body;
        const orgId = req.user.organizationId?._id || req.user.organizationId;

        // Verify asset belongs to organization
        const asset = await Asset.findOne({ _id: assetId, organizationId: orgId });
        if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

        const issue = await AssetIssue.create({
            organizationId: orgId,
            assetId,
            reportedBy: req.user._id,
            issueType,
            priority,
            description
        });

        await logActivity(req.user._id, 'REPORT_ASSET_ISSUE', 'assets', { assetId, issueType }, req, issue._id, 'AssetIssue');
        res.status(201).json({ success: true, issue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/assets/issues
exports.getIssues = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        let filter = { organizationId: orgId };
        if (req.user.role === 'employee') filter.reportedBy = req.user._id;

        const issues = await AssetIssue.find(filter)
            .populate('reportedBy', 'name email profilePhoto')
            .populate('assetId', 'name assetTag serialNumber')
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, issues });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/assets/issues/:id
exports.updateIssueStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const issue = await AssetIssue.findOne({ _id: req.params.id, organizationId: orgId });

        if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

        issue.status = status;
        if (adminNote !== undefined) issue.adminNote = adminNote;

        if (status === 'resolved' || status === 'dismissed') {
            issue.resolvedAt = new Date();
            issue.resolvedBy = req.user._id;
        }

        await issue.save();
        await logActivity(req.user._id, 'UPDATE_ASSET_ISSUE', 'assets', { status, issueId: req.params.id }, req, issue._id, 'AssetIssue');

        const populatedIssue = await AssetIssue.findById(issue._id)
            .populate('reportedBy', 'name email profilePhoto')
            .populate('assetId', 'name assetTag serialNumber')
            .populate('resolvedBy', 'name');

        res.json({ success: true, issue: populatedIssue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/assets
exports.getAssets = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        if (!orgId && req.user.role !== 'superadmin') {
            return res.status(400).json({ success: false, message: 'Organization ID is missing' });
        }

        let filter = {};
        if (orgId) filter.organizationId = orgId;
        if (req.user.role === 'employee') filter.assignedTo = req.user._id;

        const assets = await Asset.find(filter)
            .populate('assignedTo', 'name email profilePhoto')
            .sort({ createdAt: -1 });

        res.json({ success: true, assets });
    } catch (err) {
        console.error('getAssets Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/assets
exports.createAsset = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const assetData = { ...req.body, organizationId: orgId };

        if (assetData.assignedTo) {
            assetData.status = 'assigned';
            assetData.assignedDate = new Date();
            assetData.assignmentHistory = [{
                userId: assetData.assignedTo,
                assignedDate: new Date(),
                condition: 'Initial Assignment'
            }];
        }

        const asset = await Asset.create(assetData);
        await logActivity(req.user._id, 'CREATE_ASSET', 'assets', { name: asset.name }, req, asset._id, 'Asset');
        res.status(201).json({ success: true, asset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/assets/:id/assign
exports.assignAsset = async (req, res) => {
    try {
        const { userId, condition } = req.body;
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const asset = await Asset.findOne({ _id: req.params.id, organizationId: orgId });
        if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

        asset.status = 'assigned';
        asset.assignedTo = userId;
        asset.assignedDate = new Date();
        asset.assignmentHistory.push({ userId, assignedDate: new Date(), condition });

        await asset.save();
        const populatedAsset = await Asset.findById(asset._id).populate('assignedTo', 'name profilePhoto');
        await logActivity(req.user._id, 'ASSIGN_ASSET', 'assets', { userId, assetId: req.params.id }, req, asset._id, 'Asset');
        res.json({ success: true, asset: populatedAsset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/assets/:id/revoke
exports.revokeAsset = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const asset = await Asset.findOne({ _id: req.params.id, organizationId: orgId });
        if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

        // Update history for the last assignment
        const lastAssignment = asset.assignmentHistory.find(h => !h.returnDate && String(h.userId) === String(asset.assignedTo));
        if (lastAssignment) {
            lastAssignment.returnDate = new Date();
        }

        asset.status = 'available';
        asset.assignedTo = undefined;
        asset.assignedDate = undefined;

        await asset.save();
        await logActivity(req.user._id, 'REVOKE_ASSET', 'assets', { assetId: req.params.id }, req, asset._id, 'Asset');
        res.json({ success: true, asset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/assets/:id
exports.deleteAsset = async (req, res) => {
    try {
        const orgId = req.user.organizationId?._id || req.user.organizationId;
        const asset = await Asset.findOneAndDelete({ _id: req.params.id, organizationId: orgId });
        if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
        await logActivity(req.user._id, 'DELETE_ASSET', 'assets', { name: asset.name }, req, asset._id, 'Asset');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
