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
    },
    // Weekly schedule (days: 0-6, 0=Sunday)
    workingDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5]
    },
    startTime: {
        type: String,
        default: '08:00'
    },
    endTime: {
        type: String,
        default: '17:00'
    },
    slotDuration: {
        type: Number,
        default: 30
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
