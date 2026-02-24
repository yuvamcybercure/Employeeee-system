const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, default: '' },
    isPublic: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Holiday', holidaySchema);
