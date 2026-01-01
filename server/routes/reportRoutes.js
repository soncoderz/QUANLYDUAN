const express = require('express');
const router = express.Router();
const {
    getMedicationAdherenceReport,
    getMetricTrendsReport,
    getAppointmentsReport,
    getDashboardOverview
} = require('../controllers/reportController');
const { protect } = require('../middleware');

// All routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardOverview);
router.get('/medication-adherence', getMedicationAdherenceReport);
router.get('/metric-trends', getMetricTrendsReport);
router.get('/appointments', getAppointmentsReport);

module.exports = router;
