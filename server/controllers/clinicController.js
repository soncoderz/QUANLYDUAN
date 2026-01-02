const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { paginate, paginateResponse, generateTimeSlots } = require('../utils/helpers');

// @desc    Get all clinics
// @route   GET /api/clinics
// @access  Public
const getClinics = async (req, res) => {
    try {
        const { page = 1, limit = 10, specialty } = req.query;
        const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

        let query = { isActive: true };
        if (specialty) {
            query.specialty = { $in: [specialty] };
        }

        const [clinics, total] = await Promise.all([
            Clinic.find(query).skip(skip).limit(limitNum).sort({ rating: -1 }),
            Clinic.countDocuments(query)
        ]);

        // Get doctor count for each clinic
        const clinicsWithDoctorCount = await Promise.all(
            clinics.map(async (clinic) => {
                const doctorCount = await Doctor.countDocuments({ clinicId: clinic._id });
                return {
                    ...clinic.toObject(),
                    doctorCount
                };
            })
        );

        res.json({
            success: true,
            ...paginateResponse(clinicsWithDoctorCount, total, pageNum, limitNum)
        });
    } catch (error) {
        console.error('Get clinics error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get clinic by ID
// @route   GET /api/clinics/:id
// @access  Public
const getClinicById = async (req, res) => {
    try {
        const clinic = await Clinic.findById(req.params.id);

        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay phong kham'
            });
        }

        // Get doctors in this clinic
        const doctors = await Doctor.find({ clinicId: clinic._id }).populate('userId', 'email phone');

        res.json({
            success: true,
            data: {
                ...clinic.toObject(),
                doctors
            }
        });
    } catch (error) {
        console.error('Get clinic by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Search clinics
// @route   GET /api/clinics/search
// @access  Public
const searchClinics = async (req, res) => {
    try {
        const { q, specialty, rating, page = 1, limit = 10 } = req.query;
        const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

        let query = { isActive: true };

        // Text search
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } },
                { specialty: { $regex: q, $options: 'i' } }
            ];
        }

        // Filter by specialty
        if (specialty) {
            query.specialty = { $in: [specialty] };
        }

        // Filter by minimum rating
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        const [clinics, total] = await Promise.all([
            Clinic.find(query).skip(skip).limit(limitNum).sort({ rating: -1 }),
            Clinic.countDocuments(query)
        ]);

        res.json({
            success: true,
            ...paginateResponse(clinics, total, pageNum, limitNum)
        });
    } catch (error) {
        console.error('Search clinics error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get available slots for a clinic
// @route   GET /api/clinics/:id/available-slots
// @access  Public
const getAvailableSlots = async (req, res) => {
    try {
        const { date, doctorId } = req.query;
        const dateStr = typeof date === 'string' ? date : date?.date;
        const doctorIdParam = doctorId || date?.doctorId;

        if (!dateStr) {
            return res.status(400).json({
                success: false,
                error: 'Vui long cung cap ngay'
            });
        }

        const clinic = await Clinic.findById(req.params.id);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay phong kham'
            });
        }

        const dayOfWeek = new Date(dateStr).getDay();

        // Get booked appointments for the date
        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        let appointmentQuery = {
            clinicId: req.params.id,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        };

        if (doctorIdParam) {
            appointmentQuery.doctorId = doctorIdParam;
        }

        const bookedAppointments = await Appointment.find(appointmentQuery).select('timeSlot doctorId');
        const bookedSlots = bookedAppointments.map(app => ({
            time: app.timeSlot,
            doctorId: app.doctorId.toString()
        }));

        // Get doctors for this clinic
        let doctors = await Doctor.find({ clinicId: req.params.id, isAvailable: true })
            .select('fullName specialty workingDays startTime endTime slotDuration');

        if (doctorIdParam) {
            doctors = doctors.filter(d => d._id.toString() === doctorIdParam);
        }

        // Calculate available slots per doctor
        const defaultDays = [1, 2, 3, 4, 5];
        const availableSlots = doctors.map(doctor => {
            const doctorBookedSlots = bookedSlots
                .filter(slot => slot.doctorId === doctor._id.toString())
                .map(slot => slot.time);

            const workingDays = (doctor.workingDays && doctor.workingDays.length > 0) ? doctor.workingDays : defaultDays;
            // If doctor doesn't work this day, return empty slots to indicate unavailable
            if (!workingDays.includes(dayOfWeek)) {
                return {
                    doctor: {
                        id: doctor._id,
                        fullName: doctor.fullName,
                        specialty: doctor.specialty
                    },
                    slots: []
                };
            }

            const slotDuration = doctor.slotDuration || 30;
            const slotsForDoctor = generateTimeSlots(
                doctor.startTime || '08:00',
                doctor.endTime || '17:00',
                slotDuration
            );

            const slots = slotsForDoctor.map(time => ({
                time,
                available: !doctorBookedSlots.includes(time)
            }));

            return {
                doctor: {
                    id: doctor._id,
                    fullName: doctor.fullName,
                    specialty: doctor.specialty
                },
                slots
            };
        });

        res.json({
            success: true,
            data: {
                date,
                clinic: {
                    id: clinic._id,
                    name: clinic.name
                },
                availableSlots
            }
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Create clinic (Admin only)
// @route   POST /api/clinics
// @access  Private (Admin)
const createClinic = async (req, res) => {
    try {
        const clinic = await Clinic.create(req.body);

        res.status(201).json({
            success: true,
            data: clinic,
            message: 'Tao phong kham thanh cong'
        });
    } catch (error) {
        console.error('Create clinic error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Update clinic (Admin only)
// @route   PUT /api/clinics/:id
// @access  Private (Admin)
const updateClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay phong kham'
            });
        }

        res.json({
            success: true,
            data: clinic,
            message: 'Cap nhat phong kham thanh cong'
        });
    } catch (error) {
        console.error('Update clinic error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

module.exports = {
    getClinics,
    getClinicById,
    searchClinics,
    getAvailableSlots,
    createClinic,
    updateClinic
};
