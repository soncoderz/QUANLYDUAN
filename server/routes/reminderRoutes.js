const express = require('express');
const router = express.Router();
const { updateReminder, markReminderTaken, getTodayReminders } = require('../controllers/medicationController');
const { protect } = require('../middleware');

// All routes require authentication
router.use(protect);

router.get('/today', getTodayReminders);
router.put('/:id', updateReminder);
router.post('/:id/taken', markReminderTaken);

module.exports = router;
