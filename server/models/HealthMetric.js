const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    metricType: {
        type: String,
        required: [true, 'Metric type is required'],
        enum: ['weight', 'blood_pressure', 'glucose', 'heart_rate', 'temperature', 'oxygen_saturation']
    },
    value: {
        type: Number,
        required: [true, 'Value is required']
    },
    secondaryValue: {
        type: Number // For blood pressure (diastolic)
    },
    unit: {
        type: String,
        required: [true, 'Unit is required']
    },
    notes: {
        type: String
    },
    measuredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for querying metrics
healthMetricSchema.index({ patientId: 1, metricType: 1, measuredAt: -1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
