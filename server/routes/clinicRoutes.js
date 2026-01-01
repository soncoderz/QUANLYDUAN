const express = require('express');
const router = express.Router();
const { getClinics, getClinicById, searchClinics, getAvailableSlots, createClinic, updateClinic } = require('../controllers/clinicController');
const { protect, authorize } = require('../middleware');

// Public routes
router.get('/', getClinics);
router.get('/search', searchClinics);
router.get('/:id', getClinicById);
router.get('/:id/available-slots', getAvailableSlots);

// Admin only routes
router.post('/', protect, authorize('clinic_admin'), createClinic);
router.put('/:id', protect, authorize('clinic_admin'), updateClinic);

module.exports = router;
