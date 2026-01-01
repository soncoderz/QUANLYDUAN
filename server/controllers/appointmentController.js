const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const { paginate, paginateResponse } = require('../utils/helpers');

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
                .populate('doctorId', 'fullName specialty')
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
            error: 'Server error'
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
            .populate('doctorId', 'fullName specialty consultationFee');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        // Check access
        if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this appointment'
            });
        }

        res.json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Get appointment by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
                error: 'Clinic not found'
            });
        }

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
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
                error: 'This time slot is already booked'
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
            .populate('doctorId', 'fullName specialty');

        res.status(201).json({
            success: true,
            data: populatedAppointment,
            message: 'Appointment booked successfully'
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
                error: 'Appointment not found'
            });
        }

        // Check access
        if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this appointment'
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
            .populate('doctorId', 'fullName specialty');

        res.json({
            success: true,
            data: appointment,
            message: 'Appointment updated successfully'
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
                error: 'Appointment not found'
            });
        }

        // Check access
        if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this appointment'
            });
        }

        // Check if appointment can be cancelled
        if (['completed', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                error: 'Cannot cancel this appointment'
            });
        }

        appointment.status = 'cancelled';
        appointment.cancelReason = req.body.reason || 'Cancelled by user';
        appointment.cancelledAt = new Date();
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
            .populate('doctorId', 'fullName specialty')
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
            error: 'Server error'
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
                error: 'Appointment not found'
            });
        }

        if (appointment.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                error: 'Appointment cannot be confirmed'
            });
        }

        appointment.status = 'confirmed';
        appointment.confirmedAt = new Date();
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name address phone')
            .populate('doctorId', 'fullName specialty');

        // Log notification (in production, send email/push)
        console.log(`Appointment ${appointment._id} confirmed. Notify patient.`);

        res.json({
            success: true,
            data: populatedAppointment,
            message: 'Appointment confirmed successfully'
        });
    } catch (error) {
        console.error('Confirm appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
                error: 'Appointment not found'
            });
        }

        if (!['confirmed', 'in_progress'].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                error: 'Appointment cannot be completed'
            });
        }

        appointment.status = 'completed';
        appointment.completedAt = new Date();
        appointment.notes = req.body.notes || appointment.notes;
        await appointment.save();

        res.json({
            success: true,
            data: appointment,
            message: 'Appointment completed successfully'
        });
    } catch (error) {
        console.error('Complete appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
