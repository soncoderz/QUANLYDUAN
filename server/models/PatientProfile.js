const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
    },
    allergies: [{
        type: String,
        trim: true
    }],
    emergencyContact: {
        type: String,
        trim: true
    },
    emergencyPhone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String
    },
    address: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
