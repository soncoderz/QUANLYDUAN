const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord'
    },
    name: {
        type: String,
        required: [true, 'Medication name is required'],
        trim: true
    },
    dosage: {
        type: String,
        trim: true
    },
    frequency: {
        type: String,
        trim: true
    },
    instructions: {
        type: String
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }
}, {
    timestamps: true
});

// Index for querying medications
medicationSchema.index({ patientId: 1, isActive: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
