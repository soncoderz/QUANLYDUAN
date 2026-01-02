const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    diagnosis: {
        type: String,
        required: [true, 'Diagnosis is required']
    },
    treatment: {
        type: String
    },
    doctorNotes: {
        type: String
    },
    symptoms: {
        type: String
    },
    vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        weight: Number,
        height: Number
    },
    testResults: [{
        testName: String,
        result: String,
        date: Date,
        notes: String
    }],
    prescriptions: [{
        name: {
            type: String,
            required: true
        },
        dosage: String,         // "2 viên", "5ml"
        frequency: String,      // "1 lần/ngày", "2 lần/ngày"
        duration: String,       // "7 ngày", "14 ngày"
        instructions: String    // "Uống sau ăn", "Trước khi ngủ"
    }],
    recordDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for querying records
medicalRecordSchema.index({ patientId: 1, recordDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
