const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    medicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reminderTime: {
        type: String,
        required: [true, 'Reminder time is required']
    },
    daysOfWeek: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastTriggered: {
        type: Date
    },
    takenHistory: [{
        date: Date,
        taken: Boolean,
        takenAt: Date
    }]
}, {
    timestamps: true
});

// Index for querying reminders
reminderSchema.index({ patientId: 1, isActive: 1 });
reminderSchema.index({ medicationId: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
