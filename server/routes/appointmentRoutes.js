const express = require('express');
const router = express.Router();
const {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    confirmAppointment,
    completeAppointment
} = require('../controllers/appointmentController');
const { protect, authorize, validate, schemas } = require('../middleware');

// All routes require authentication
router.use(protect);

router.get('/', getAppointments);
router.get('/upcoming', getUpcomingAppointments);
router.get('/:id', getAppointmentById);
router.post('/', validate(schemas.createAppointment), createAppointment);
router.put('/:id', validate(schemas.updateAppointment), updateAppointment);
router.delete('/:id', cancelAppointment);

// Doctor/Admin actions
router.post('/:id/confirm', authorize('doctor', 'clinic_admin'), confirmAppointment);
router.post('/:id/complete', authorize('doctor'), completeAppointment);

module.exports = router;
