const Asset = require('../models/Asset');
const { logActivity } = require('../middleware/logger');

// GET /api/assets
exports.getAssets = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'employee') filter.assignedTo = req.user._id;
        const assets = await Asset.find(filter).populate('assignedTo', 'name');
        res.json({ success: true, assets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/assets
exports.createAsset = async (req, res) => {
    try {
        const asset = await Asset.create(req.body);
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
        const asset = await Asset.findById(req.params.id);
        asset.status = 'assigned';
        asset.assignedTo = userId;
        asset.assignedDate = new Date();
        asset.assignmentHistory.push({ userId, assignedDate: new Date(), condition });
        await asset.save();
        await logActivity(req.user._id, 'ASSIGN_ASSET', 'assets', { userId, assetId: req.params.id }, req, asset._id, 'Asset');
        res.json({ success: true, asset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
