const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Clinic name is required'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    specialty: [{
        type: String,
        trim: true
    }],
    description: {
        type: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    workingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

// Index for search
clinicSchema.index({ name: 'text', specialty: 'text', address: 'text' });

module.exports = mongoose.model('Clinic', clinicSchema);
