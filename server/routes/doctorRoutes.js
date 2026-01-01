const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, getDoctorDashboard } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware');

// Public routes
router.get('/', getDoctors);
router.get('/dashboard', protect, authorize('doctor'), getDoctorDashboard);
router.get('/:id', getDoctorById);

module.exports = router;
