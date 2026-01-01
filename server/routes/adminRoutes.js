const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware');
const {
    // Dashboard
    getDashboardStats,
    // Users
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    // Doctors
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    toggleDoctorAvailability,
    // Clinics
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    toggleClinicStatus,
    // Appointments
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    // Reports
    getOverviewReport,
    getAppointmentReport
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, authorize('clinic_admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', toggleUserStatus);

// Doctor Management
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.patch('/doctors/:id/availability', toggleDoctorAvailability);

// Clinic Management
router.get('/clinics', getClinics);
router.get('/clinics/:id', getClinicById);
router.post('/clinics', createClinic);
router.put('/clinics/:id', updateClinic);
router.delete('/clinics/:id', deleteClinic);
router.patch('/clinics/:id/status', toggleClinicStatus);

// Appointment Management
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// Reports
router.get('/reports/overview', getOverviewReport);
router.get('/reports/appointments', getAppointmentReport);

module.exports = router;
