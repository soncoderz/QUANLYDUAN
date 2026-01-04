require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const {
    apiLimiter,
    requestLogger,
    basicSecurity,
    detectMaliciousPayload,
    errorHandler,
    notFound
} = require('./middleware');

// Import routes
const {
    authRoutes,
    profileRoutes,
    clinicRoutes,
    doctorRoutes,
    appointmentRoutes,
    medicalRecordRoutes,
    medicationRoutes,
    reminderRoutes,
    healthMetricRoutes,
    reportRoutes,
    adminRoutes,
    uploadRoutes
} = require('./routes');

// Import cron jobs
const { initAppointmentReminderCron } = require('./cron/appointmentReminder');

// Initialize app
const app = express();

// Hide tech stack header
app.disable('x-powered-by');

// Connect to database
connectDB();

// Initialize cron jobs
initAppointmentReminderCron();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
// Increase body size limits to handle image URLs/base64 payloads from admin uploads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(requestLogger);
app.use(basicSecurity);
app.use(detectMaliciousPayload);

// Rate limiting for all API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', medicalRecordRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/health-metrics', healthMetricRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Healthcare Booking API is running' });
});

// 404 and error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         Healthcare Booking API Server                     ║
╠════════════════════════════════════════════════════════════╣
║  Server running on port: ${PORT}                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}                          ║
║  API URL: http://localhost:${PORT}/api                      ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
