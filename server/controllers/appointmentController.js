const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const Medication = require('../models/Medication');
const HealthMetric = require('../models/HealthMetric');
const PatientProfile = require('../models/PatientProfile');
const { paginate, paginateResponse, generateTimeSlots } = require('../utils/helpers');

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;
        const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

        let query = {};

        // Role-based filtering
        if (req.user.role === 'patient') {
            query.patientId = req.user._id;
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ userId: req.user._id });
            if (doctor) {
                query.doctorId = doctor._id;
            }
        }
        // clinic_admin can see all appointments for their clinic

        // Status filter
        if (status) {
            query.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            query.appointmentDate = {};
            if (startDate) query.appointmentDate.$gte = new Date(startDate);
            if (endDate) query.appointmentDate.$lte = new Date(endDate);
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .populate('patientId', 'email phone')
                .populate('clinicId', 'name address phone')
                .populate('doctorId', 'fullName specialty avatar')
                .skip(skip)
                .limit(limitNum)
                .sort({ appointmentDate: -1 }),
            Appointment.countDocuments(query)
        ]);

        res.json({
            success: true,
            ...paginateResponse(appointments, total, pageNum, limitNum)
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name address phone')
            .populate('doctorId', 'fullName specialty consultationFee avatar');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay lich kham'
            });
        }

        // Check access
        if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Ban khong co quyen xem lich kham nay'
            });
        }

        // Medications linked to this appointment
        const medications = await Medication.find({ appointmentId: appointment._id }).sort({ createdAt: -1 });

        // Patient profile and latest health metrics
        const profile = await PatientProfile.findOne({ userId: appointment.patientId._id });
        const metricTypes = ['weight', 'blood_pressure', 'glucose', 'heart_rate', 'temperature', 'oxygen_saturation'];
        const healthMetrics = {};
        for (const type of metricTypes) {
            const metric = await HealthMetric.findOne({ patientId: appointment.patientId._id, metricType: type })
                .sort({ measuredAt: -1 });
            if (metric) {
                healthMetrics[type] = metric;
            }
        }

        res.json({
            success: true,
            data: {
                appointment,
                patientProfile: profile,
                medications,
                healthMetrics
            }
        });
    } catch (error) {
        console.error('Get appointment by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
    try {
        const { clinicId, doctorId, appointmentDate, timeSlot, type, reason, symptoms } = req.body;

        // Validate clinic and doctor exist
        const [clinic, doctor] = await Promise.all([
            Clinic.findById(clinicId),
            Doctor.findById(doctorId)
        ]);

        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay phong kham'
            });
        }

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay bac si'
            });
        }

        // Validate slot is within doctor's working schedule
        const workingDays = (doctor.workingDays && doctor.workingDays.length > 0) ? doctor.workingDays : [1, 2, 3, 4, 5];
        const appointmentDay = new Date(appointmentDate).getDay();
        if (!workingDays.includes(appointmentDay)) {
            return res.status(400).json({
                success: false,
                error: 'Bac si khong lam viec ngay nay'
            });
        }

        const allowedSlots = generateTimeSlots(
            doctor.startTime || '08:00',
            doctor.endTime || '17:00',
            doctor.slotDuration || 30
        );

        if (!allowedSlots.includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                error: 'Khung gio khong nam trong lich lam viec cua bac si'
            });
        }

        // Check if slot is available
        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate: {
                $gte: new Date(new Date(appointmentDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(appointmentDate).setHours(23, 59, 59, 999))
            },
            timeSlot,
            status: { $nin: ['cancelled'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                error: 'Khung gio nay da duoc dat'
            });
        }

        const appointment = await Appointment.create({
            patientId: req.user._id,
            clinicId,
            doctorId,
            appointmentDate,
            timeSlot,
            type: type || 'consultation',
            reason,
            symptoms
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name address phone')
            .populate('doctorId', 'fullName specialty avatar');

        res.status(201).json({
            success: true,
            data: populatedAppointment,
            message: 'Dat lich thanh cong'
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay lich kham'
            });
        }

        // Check access
        if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Ban khong co quyen cap nhat lich kham nay'
            });
        }

        // Patients can only update certain fields
        const allowedUpdates = ['appointmentDate', 'timeSlot', 'reason', 'symptoms'];
        if (req.user.role === 'patient') {
            Object.keys(req.body).forEach(key => {
                if (!allowedUpdates.includes(key)) {
                    delete req.body[key];
                }
            });
        }

        appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name address phone')
            .populate('doctorId', 'fullName specialty avatar');

        res.json({
            success: true,
            data: appointment,
            message: 'Cap nhat lich kham thanh cong'
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay lich kham'
            });
        }

        // Check access
        if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Ban khong co quyen huy lich kham nay'
            });
        }

        // Check if appointment can be cancelled
        if (['completed', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                error: 'Khong the huy lich kham nay'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancelReason = req.body.reason || 'Cancelled by user';
        appointment.cancelledAt = new Date();
        await appointment.save();

        res.json({
            success: true,
            message: 'Huy lich kham thanh cong'
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
const getUpcomingAppointments = async (req, res) => {
    try {
        let query = {
            appointmentDate: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] }
        };

        // Role-based filtering
        if (req.user.role === 'patient') {
            query.patientId = req.user._id;
        } else if (req.user.role === 'doctor') {
            const doctor = await Doctor.findOne({ userId: req.user._id });
            if (doctor) {
                query.doctorId = doctor._id;
            }
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name address phone')
            .populate('doctorId', 'fullName specialty avatar')
            .sort({ appointmentDate: 1 })
            .limit(10);

        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        console.error('Get upcoming appointments error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Confirm appointment (Doctor/Admin)
// @route   POST /api/appointments/:id/confirm
// @access  Private (Doctor/Admin)
const confirmAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay lich kham'
            });
        }

        if (appointment.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                error: 'Khong the xac nhan lich kham nay'
            });
        }

        appointment.status = 'confirmed';
        appointment.confirmedAt = new Date();
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name address phone')
            .populate('doctorId', 'fullName specialty avatar');

        // Log notification (in production, send email/push)
        console.log(`Appointment ${appointment._id} confirmed. Notify patient.`);

        res.json({
            success: true,
            data: populatedAppointment,
            message: 'Xac nhan lich kham thanh cong'
        });
    } catch (error) {
        console.error('Confirm appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Complete appointment (Doctor)
// @route   POST /api/appointments/:id/complete
// @access  Private (Doctor)
const completeAppointment = async (req, res) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay lich kham'
            });
        }

        if (!['confirmed', 'in_progress'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                error: 'Khong the hoan tat lich kham nay'
            });
        }

        appointment.status = 'completed';
        appointment.completedAt = new Date();
        appointment.notes = req.body.notes || appointment.notes;
        await appointment.save();

        res.json({
            success: true,
            data: appointment,
            message: 'Hoan tat lich kham thanh cong'
        });
    } catch (error) {
        console.error('Complete appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

module.exports = {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getUpcomingAppointments,
    confirmAppointment,
    completeAppointment
};
