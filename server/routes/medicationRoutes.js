const express = require('express');
const router = express.Router();
const {
    getMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication,
    createReminder,
    updateReminder,
    markReminderTaken,
    getTodayReminders
} = require('../controllers/medicationController');
const { protect, validate, schemas } = require('../middleware');

// All routes require authentication
router.use(protect);

// Medication routes
router.get('/', getMedications);
router.get('/:id', getMedicationById);
router.post('/', validate(schemas.createMedication), createMedication);
router.put('/:id', updateMedication);
router.delete('/:id', deleteMedication);

// Reminder routes
router.post('/:id/reminders', validate(schemas.createReminder), createReminder);

module.exports = router;
