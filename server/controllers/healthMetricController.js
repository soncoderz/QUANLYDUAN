const HealthMetric = require('../models/HealthMetric');
const { paginate, paginateResponse } = require('../utils/helpers');

// @desc    Get health metrics
// @route   GET /api/health-metrics
// @access  Private
const getHealthMetrics = async (req, res) => {
    try {
        const { page = 1, limit = 20, metricType, startDate, endDate } = req.query;
        const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

        let query = { patientId: req.user._id };

        if (metricType) {
            query.metricType = metricType;
        }

        if (startDate || endDate) {
            query.measuredAt = {};
            if (startDate) query.measuredAt.$gte = new Date(startDate);
            if (endDate) query.measuredAt.$lte = new Date(endDate);
        }

        const [metrics, total] = await Promise.all([
            HealthMetric.find(query)
                .skip(skip)
                .limit(limitNum)
                .sort({ measuredAt: -1 }),
            HealthMetric.countDocuments(query)
        ]);

        res.json({
            success: true,
            ...paginateResponse(metrics, total, pageNum, limitNum)
        });
    } catch (error) {
        console.error('Get health metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Create health metric
// @route   POST /api/health-metrics
// @access  Private
const createHealthMetric = async (req, res) => {
    try {
        const { metricType, value, secondaryValue, unit, notes, measuredAt } = req.body;

        const metric = await HealthMetric.create({
            patientId: req.user._id,
            metricType,
            value,
            secondaryValue,
            unit,
            notes,
            measuredAt: measuredAt || new Date()
        });

        res.status(201).json({
            success: true,
            data: metric,
            message: 'Luu chi so suc khoe thanh cong'
        });
    } catch (error) {
        console.error('Create health metric error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get health metric trends
// @route   GET /api/health-metrics/trends
// @access  Private
const getHealthMetricTrends = async (req, res) => {
    try {
        const { metricType, period = '3m' } = req.query;

        // Calculate date range based on period
        let startDate = new Date();
        switch (period) {
            case '1w':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '1m':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '3m':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case '6m':
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(startDate.getMonth() - 3);
        }

        let matchQuery = {
            patientId: req.user._id,
            measuredAt: { $gte: startDate }
        };

        if (metricType) {
            matchQuery.metricType = metricType;
        }

        // Get metrics grouped by type
        const trends = await HealthMetric.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$metricType',
                    avgValue: { $avg: '$value' },
                    minValue: { $min: '$value' },
                    maxValue: { $max: '$value' },
                    count: { $sum: 1 },
                    latestValue: { $last: '$value' },
                    latestDate: { $last: '$measuredAt' },
                    unit: { $first: '$unit' }
                }
            }
        ]);

        // Get time series data for charts
        const timeSeriesData = await HealthMetric.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        type: '$metricType',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$measuredAt' } }
                    },
                    avgValue: { $avg: '$value' },
                    unit: { $first: '$unit' }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Organize time series by metric type
        const chartData = {};
        timeSeriesData.forEach(item => {
            if (!chartData[item._id.type]) {
                chartData[item._id.type] = [];
            }
            chartData[item._id.type].push({
                date: item._id.date,
                value: Math.round(item.avgValue * 100) / 100,
                unit: item.unit
            });
        });

        res.json({
            success: true,
            data: {
                summary: trends.map(t => ({
                    metricType: t._id,
                    average: Math.round(t.avgValue * 100) / 100,
                    min: t.minValue,
                    max: t.maxValue,
                    count: t.count,
                    latest: t.latestValue,
                    latestDate: t.latestDate,
                    unit: t.unit
                })),
                chartData,
                period
            }
        });
    } catch (error) {
        console.error('Get health metric trends error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get latest metrics
// @route   GET /api/health-metrics/latest
// @access  Private
const getLatestMetrics = async (req, res) => {
    try {
        const metricTypes = ['weight', 'blood_pressure', 'glucose', 'heart_rate', 'temperature', 'oxygen_saturation'];

        const latestMetrics = await Promise.all(
            metricTypes.map(async (type) => {
                const metric = await HealthMetric.findOne({
                    patientId: req.user._id,
                    metricType: type
                }).sort({ measuredAt: -1 });

                return metric ? {
                    metricType: type,
                    value: metric.value,
                    secondaryValue: metric.secondaryValue,
                    unit: metric.unit,
                    measuredAt: metric.measuredAt
                } : null;
            })
        );

        res.json({
            success: true,
            data: latestMetrics.filter(m => m !== null)
        });
    } catch (error) {
        console.error('Get latest metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

module.exports = {
    getHealthMetrics,
    createHealthMetric,
    getHealthMetricTrends,
    getLatestMetrics
};
