const Asset = require('../models/Asset');
const AssetIssue = require('../models/AssetIssue');
const { logActivity } = require('../middleware/logger');

// ... (existing asset methods)

// POST /api/assets/issues
exports.reportIssue = async (req, res) => {
    try {
        const { assetId, issueType, priority, description } = req.body;

        // Verify asset belongs to organization
        const asset = await Asset.findOne({ _id: assetId, organizationId: req.user.organizationId._id });
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        const issue = await AssetIssue.create({
            organizationId: req.user.organizationId._id,
            assetId,
            reportedBy: req.user._id,
            issueType,
            priority,
            description
        });

        await logActivity(req.user._id, 'REPORT_ASSET_ISSUE', 'assets', { assetId, issueType }, req, issue._id, 'AssetIssue');
        res.status(201).json({ success: true, issue });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/assets/issues
exports.getIssues = async (req, res) => {
    try {
        let filter = { organizationId: req.user.organizationId._id };
        if (req.user.role === 'employee') filter.reportedBy = req.user._id;

        const issues = await AssetIssue.find(filter)
            .populate('reportedBy', 'name email profilePhoto')
            .populate('assetId', 'name assetTag serialNumber')
            .populate('resolvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, issues });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/assets/issues/:id
exports.updateIssueStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const issue = await AssetIssue.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id });

        if (!issue) return res.status(404).json({ message: 'Issue not found' });

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
        res.status(500).json({ message: err.message });
    }
};

// GET /api/assets
exports.getAssets = async (req, res) => {
    try {
        let filter = { organizationId: req.user.organizationId._id };
        if (req.user.role === 'employee') filter.assignedTo = req.user._id;
        const assets = await Asset.find(filter).populate('assignedTo', 'name profilePhoto').sort({ createdAt: -1 });
        res.json({ success: true, assets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/assets
exports.createAsset = async (req, res) => {
    try {
        const assetData = { ...req.body, organizationId: req.user.organizationId._id };

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
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/assets/:id/assign
exports.assignAsset = async (req, res) => {
    try {
        const { userId, condition } = req.body;
        const asset = await Asset.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id });
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

        asset.status = 'assigned';
        asset.assignedTo = userId;
        asset.assignedDate = new Date();
        asset.assignmentHistory.push({ userId, assignedDate: new Date(), condition });

        await asset.save();
        const populatedAsset = await Asset.findById(asset._id).populate('assignedTo', 'name profilePhoto');
        await logActivity(req.user._id, 'ASSIGN_ASSET', 'assets', { userId, assetId: req.params.id }, req, asset._id, 'Asset');
        res.json({ success: true, asset: populatedAsset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/assets/:id/revoke
exports.revokeAsset = async (req, res) => {
    try {
        const asset = await Asset.findOne({ _id: req.params.id, organizationId: req.user.organizationId._id });
        if (!asset) return res.status(404).json({ message: 'Asset not found' });

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
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/assets/:id
exports.deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId._id });
        if (!asset) return res.status(404).json({ message: 'Asset not found' });
        await logActivity(req.user._id, 'DELETE_ASSET', 'assets', { name: asset.name }, req, asset._id, 'Asset');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
