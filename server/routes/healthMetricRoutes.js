const express = require('express');
const router = express.Router();
const {
    getHealthMetrics,
    createHealthMetric,
    getHealthMetricTrends,
    getLatestMetrics
} = require('../controllers/healthMetricController');
const { protect, validate, schemas } = require('../middleware');

// All routes require authentication
router.use(protect);

router.get('/', getHealthMetrics);
router.get('/trends', getHealthMetricTrends);
router.get('/latest', getLatestMetrics);
router.post('/', validate(schemas.createHealthMetric), createHealthMetric);

module.exports = router;
