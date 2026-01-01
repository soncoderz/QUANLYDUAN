const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required']
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    type: {
        type: String,
        enum: ['consultation', 'checkup', 'follow-up'],
        default: 'consultation'
    },
    reason: {
        type: String,
        trim: true
    },
    symptoms: {
        type: String,
        trim: true
    },
    notes: {
        type: String
    },
    cancelReason: {
        type: String
    },
    cancelledAt: {
        type: Date
    },
    confirmedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for querying appointments
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ clinicId: 1, appointmentDate: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
