const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { paginate, paginateResponse } = require('../utils/helpers');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
    try {
        const { page = 1, limit = 10, specialty, clinicId } = req.query;
        const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

        let query = { isAvailable: true };

        if (specialty) {
            query.specialty = { $regex: specialty, $options: 'i' };
        }

        if (clinicId) {
            query.clinicId = clinicId;
        }

        const [doctors, total] = await Promise.all([
            Doctor.find(query)
                .populate('clinicId', 'name address')
                .populate('userId', 'email phone')
                .skip(skip)
                .limit(limitNum)
                .sort({ fullName: 1 }),
            Doctor.countDocuments(query)
        ]);

        res.json({
            success: true,
            ...paginateResponse(doctors, total, pageNum, limitNum)
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('clinicId', 'name address phone')
            .populate('userId', 'email phone');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Get doctor by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get doctor dashboard (for doctor role)
// @route   GET /api/doctors/dashboard
// @access  Private (Doctor)
const getDoctorDashboard = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor profile not found'
            });
        }

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Get today's appointments
        const todayAppointments = await Appointment.find({
            doctorId: doctor._id,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        })
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name')
            .sort({ timeSlot: 1 });

        // Get pending appointments (need confirmation)
        const pendingAppointments = await Appointment.find({
            doctorId: doctor._id,
            status: 'scheduled'
        })
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name')
            .sort({ appointmentDate: 1 })
            .limit(10);

        // Get stats
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const [totalThisMonth, completedThisMonth] = await Promise.all([
            Appointment.countDocuments({
                doctorId: doctor._id,
                appointmentDate: { $gte: startOfMonth }
            }),
            Appointment.countDocuments({
                doctorId: doctor._id,
                appointmentDate: { $gte: startOfMonth },
                status: 'completed'
            })
        ]);

        res.json({
            success: true,
            data: {
                doctor: {
                    id: doctor._id,
                    fullName: doctor.fullName,
                    specialty: doctor.specialty
                },
                todayAppointments,
                pendingAppointments,
                stats: {
                    todayCount: todayAppointments.length,
                    pendingCount: pendingAppointments.length,
                    totalThisMonth,
                    completedThisMonth
                }
            }
        });
    } catch (error) {
        console.error('Get doctor dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    getDoctors,
    getDoctorById,
    getDoctorDashboard
};
