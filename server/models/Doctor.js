const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    specialty: {
        type: String,
        trim: true
    },
    licenseNumber: {
        type: String,
        trim: true
    },
    experience: {
        type: Number,
        default: 0
    },
    education: {
        type: String
    },
    description: {
        type: String
    },
    consultationFee: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
