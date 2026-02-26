const Organization = require('../models/Organization');
const { logActivity } = require('../middleware/logger');
const { uploadBase64 } = require('../config/cloudinary');

// PATCH /api/organization/:id
exports.updateOrganization = async (req, res) => {
    try {
        const { name, slug, settings, logo } = req.body;
        const org = await Organization.findById(req.params.id);

        if (!org) return res.status(404).json({ message: 'Organization not found' });

        if (name) org.name = name;
        if (slug) org.slug = slug;
        if (settings) org.settings = { ...org.settings, ...settings };

        if (logo && logo.startsWith('data:image')) {
            const uploadResult = await uploadBase64(logo, 'branding');
            org.logo = uploadResult.url;
        } else if (logo === null) {
            org.logo = '';
        }

        await org.save();

        await logActivity(req.user._id, 'UPDATE_ORG', 'organization', { name, slug }, req, org._id, 'Organization');

        res.json({ success: true, organization: org });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/organization/:id
exports.getOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) return res.status(404).json({ message: 'Organization not found' });
        res.json({ success: true, organization: org });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
