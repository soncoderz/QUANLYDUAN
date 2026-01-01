const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const HealthMetric = require('../models/HealthMetric');
const Medication = require('../models/Medication');

// @desc    Get medication adherence report
// @route   GET /api/reports/medication-adherence
// @access  Private
const getMedicationAdherenceReport = async (req, res) => {
    try {
        const { startDate, endDate, medicationId } = req.query;

        // Default to last 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        let medicationQuery = { patientId: req.user._id, isActive: true };
        if (medicationId) {
            medicationQuery._id = medicationId;
        }

        const medications = await Medication.find(medicationQuery);

        const adherenceData = await Promise.all(
            medications.map(async (med) => {
                const reminders = await Reminder.find({ medicationId: med._id });

                let totalScheduled = 0;
                let totalTaken = 0;

                reminders.forEach(reminder => {
                    reminder.takenHistory.forEach(history => {
                        if (history.date >= start && history.date <= end) {
                            totalScheduled++;
                            if (history.taken) {
                                totalTaken++;
                            }
                        }
                    });
                });

                // Estimate scheduled based on days and reminders if no history
                if (totalScheduled === 0 && reminders.length > 0) {
                    const days = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
                    totalScheduled = days * reminders.length;
                }

                const adherenceRate = totalScheduled > 0
                    ? Math.round((totalTaken / totalScheduled) * 100)
                    : 0;

                return {
                    medication: {
                        id: med._id,
                        name: med.name,
                        dosage: med.dosage,
                        frequency: med.frequency
                    },
                    totalScheduled,
                    totalTaken,
                    totalMissed: totalScheduled - totalTaken,
                    adherenceRate
                };
            })
        );

        // Calculate overall adherence
        const totalScheduledAll = adherenceData.reduce((sum, d) => sum + d.totalScheduled, 0);
        const totalTakenAll = adherenceData.reduce((sum, d) => sum + d.totalTaken, 0);
        const overallAdherence = totalScheduledAll > 0
            ? Math.round((totalTakenAll / totalScheduledAll) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                period: { start, end },
                overallAdherence,
                totalScheduled: totalScheduledAll,
                totalTaken: totalTakenAll,
                totalMissed: totalScheduledAll - totalTakenAll,
                medications: adherenceData,
                chartData: {
                    taken: totalTakenAll,
                    missed: totalScheduledAll - totalTakenAll
                }
            }
        });
    } catch (error) {
        console.error('Get medication adherence report error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get metric trends report
// @route   GET /api/reports/metric-trends
// @access  Private
const getMetricTrendsReport = async (req, res) => {
    try {
        const { metricType, startDate, endDate } = req.query;

        // Default to last 3 months
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

        let matchQuery = {
            patientId: req.user._id,
            measuredAt: { $gte: start, $lte: end }
        };

        if (metricType) {
            matchQuery.metricType = metricType;
        }

        // Get aggregated data
        const metrics = await HealthMetric.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$metricType',
                    avgValue: { $avg: '$value' },
                    minValue: { $min: '$value' },
                    maxValue: { $max: '$value' },
                    count: { $sum: 1 },
                    unit: { $first: '$unit' }
                }
            }
        ]);

        // Get daily data for chart
        const dailyData = await HealthMetric.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        type: '$metricType',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$measuredAt' } }
                    },
                    avgValue: { $avg: '$value' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Standard ranges for comparison
        const standardRanges = {
            weight: { min: 50, max: 80, unit: 'kg' },
            blood_pressure: { min: 90, max: 120, unit: 'mmHg' },
            glucose: { min: 70, max: 100, unit: 'mg/dL' },
            heart_rate: { min: 60, max: 100, unit: 'bpm' },
            temperature: { min: 36.1, max: 37.2, unit: '°C' },
            oxygen_saturation: { min: 95, max: 100, unit: '%' }
        };

        // Organize chart data
        const chartData = {};
        dailyData.forEach(item => {
            if (!chartData[item._id.type]) {
                chartData[item._id.type] = [];
            }
            chartData[item._id.type].push({
                date: item._id.date,
                value: Math.round(item.avgValue * 100) / 100
            });
        });

        res.json({
            success: true,
            data: {
                period: { start, end },
                summary: metrics.map(m => ({
                    metricType: m._id,
                    average: Math.round(m.avgValue * 100) / 100,
                    min: m.minValue,
                    max: m.maxValue,
                    count: m.count,
                    unit: m.unit,
                    standardRange: standardRanges[m._id] || null
                })),
                chartData
            }
        });
    } catch (error) {
        console.error('Get metric trends report error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get appointments report
// @route   GET /api/reports/appointments
// @access  Private
const getAppointmentsReport = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;

        // Default to last 6 months
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 180 * 24 * 60 * 60 * 1000);

        let matchQuery = {
            patientId: req.user._id,
            createdAt: { $gte: start, $lte: end }
        };

        if (type) {
            matchQuery.type = type;
        }

        // Get total counts by status
        const statusCounts = await Appointment.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get counts by type
        const typeCounts = await Appointment.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get monthly data for chart
        const monthlyData = await Appointment.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        month: { $dateToString: { format: '%Y-%m', date: '$appointmentDate' } }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);

        // Calculate statistics
        const totalAppointments = statusCounts.reduce((sum, s) => sum + s.count, 0);
        const completedCount = statusCounts.find(s => s._id === 'completed')?.count || 0;
        const cancelledCount = statusCounts.find(s => s._id === 'cancelled')?.count || 0;

        const months = Math.max(1, Math.ceil((end - start) / (30 * 24 * 60 * 60 * 1000)));
        const avgPerMonth = Math.round((totalAppointments / months) * 100) / 100;

        res.json({
            success: true,
            data: {
                period: { start, end },
                totalAppointments,
                completedAppointments: completedCount,
                cancelledAppointments: cancelledCount,
                averagePerMonth: avgPerMonth,
                byStatus: statusCounts.reduce((obj, s) => {
                    obj[s._id] = s.count;
                    return obj;
                }, {}),
                byType: typeCounts.reduce((obj, t) => {
                    obj[t._id] = t.count;
                    return obj;
                }, {}),
                monthlyChart: monthlyData.map(m => ({
                    month: m._id.month,
                    count: m.count
                }))
            }
        });
    } catch (error) {
        console.error('Get appointments report error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardOverview = async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        // Get appointments this month
        const appointmentsThisMonth = await Appointment.countDocuments({
            patientId: req.user._id,
            appointmentDate: { $gte: startOfMonth }
        });

        // Get upcoming appointments
        const upcomingAppointments = await Appointment.find({
            patientId: req.user._id,
            appointmentDate: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .populate('clinicId', 'name')
            .populate('doctorId', 'fullName specialty')
            .sort({ appointmentDate: 1 })
            .limit(5);

        // Get active medications
        const activeMedications = await Medication.countDocuments({
            patientId: req.user._id,
            isActive: true
        });

        // Get today's reminders
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
        const todayReminders = await Reminder.find({
            patientId: req.user._id,
            isActive: true,
            daysOfWeek: { $in: [dayOfWeek] }
        }).populate('medicationId', 'name dosage');

        // Calculate medication adherence (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const reminders = await Reminder.find({ patientId: req.user._id });
        let totalScheduled = 0;
        let totalTaken = 0;
        reminders.forEach(r => {
            r.takenHistory.forEach(h => {
                if (h.date >= weekAgo) {
                    totalScheduled++;
                    if (h.taken) totalTaken++;
                }
            });
        });
        const adherenceRate = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 100;

        // Get latest health metrics
        const metricTypes = ['weight', 'blood_pressure', 'glucose', 'heart_rate'];
        const latestMetrics = await Promise.all(
            metricTypes.map(async (type) => {
                const metric = await HealthMetric.findOne({
                    patientId: req.user._id,
                    metricType: type
                }).sort({ measuredAt: -1 });
                return metric;
            })
        );

        // Get appointment frequency (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyAppointments = await Appointment.aggregate([
            {
                $match: {
                    patientId: req.user._id,
                    appointmentDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$appointmentDate' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                appointmentsThisMonth,
                activeMedications,
                medicationAdherence: adherenceRate,
                upcomingAppointments,
                todayReminders: todayReminders.map(r => ({
                    id: r._id,
                    time: r.reminderTime,
                    medication: r.medicationId
                })),
                latestMetrics: latestMetrics.filter(m => m).map(m => ({
                    type: m.metricType,
                    value: m.value,
                    unit: m.unit,
                    measuredAt: m.measuredAt
                })),
                charts: {
                    appointmentFrequency: monthlyAppointments.map(m => ({
                        month: m._id,
                        count: m.count
                    }))
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard overview error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    getMedicationAdherenceReport,
    getMetricTrendsReport,
    getAppointmentsReport,
    getDashboardOverview
};
