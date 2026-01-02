const express = require('express');
const router = express.Router();
const {
    getDoctors,
    getDoctorById,
    getDoctorDashboard,
    getMyAppointments,
    updateAppointmentStatus,
    getMyPatients,
    getPatientDetails,
    updateDoctorProfile,
    createMedicalRecord
} = require('../controllers/doctorController');
const { protect, authorize, validate, schemas } = require('../middleware');

// Public routes
router.get('/', getDoctors);

// Private doctor routes (must be before /:id)
router.get('/dashboard', protect, authorize('doctor'), getDoctorDashboard);
router.get('/my-appointments', protect, authorize('doctor'), getMyAppointments);
router.get('/my-patients', protect, authorize('doctor'), getMyPatients);
router.get('/patients/:id', protect, authorize('doctor'), getPatientDetails);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.patch('/appointments/:id/status', protect, authorize('doctor'), validate(schemas.updateDoctorAppointmentStatus), updateAppointmentStatus);
router.post('/records', protect, authorize('doctor'), validate(schemas.createMedicalRecord), createMedicalRecord);

// Public route with param (must be last)
router.get('/:id', getDoctorById);

module.exports = router;

