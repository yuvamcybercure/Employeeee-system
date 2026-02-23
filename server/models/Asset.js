const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    assetTag: { type: String, unique: true, sparse: true },
    category: {
        type: String,
        enum: ['laptop', 'mobile', 'monitor', 'keyboard', 'mouse', 'headset', 'furniture', 'vehicle', 'other'],
        default: 'other',
    },
    brand: { type: String, default: '' },
    model: { type: String, default: '' },
    serialNumber: { type: String, default: '' },
    purchaseDate: { type: Date },
    purchaseValue: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['available', 'assigned', 'under-repair', 'retired'],
        default: 'available',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedDate: { type: Date },
    returnDate: { type: Date },
    description: { type: String, default: '' },
    photo: { type: String, default: '' },
    assignmentHistory: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedDate: { type: Date },
        returnDate: { type: Date },
        condition: { type: String, default: '' },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
