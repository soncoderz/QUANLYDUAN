const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const MedicalRecord = require('../models/MedicalRecord');
const Medication = require('../models/Medication');
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
            error: 'Co loi he thong, vui long thu lai'
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
                error: 'Khong tim thay bac si'
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
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get doctor dashboard (for doctor role)
// @route   GET /api/doctors/dashboard
// @access  Private (Doctor)
const getDoctorDashboard = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id })
            .populate('clinicId', 'name address');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so bac si'
            });
        }

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

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
            status: { $in: ['scheduled', 'pending'] }
        })
            .populate('patientId', 'email phone')
            .populate('clinicId', 'name')
            .sort({ appointmentDate: 1 })
            .limit(10);

        // Fetch patient profiles for avatars/names
        const patientIds = [
            ...todayAppointments.map(a => a.patientId?._id).filter(Boolean),
            ...pendingAppointments.map(a => a.patientId?._id).filter(Boolean)
        ];
        const profiles = await PatientProfile.find({ userId: { $in: patientIds } });
        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.userId.toString()] = p;
        });

        const withProfile = (arr) => arr.map(a => ({
            ...a.toObject(),
            patientProfile: profileMap[a.patientId?._id?.toString()] || null
        }));
        const todayAppointmentsWithProfile = withProfile(todayAppointments);
        const pendingAppointmentsWithProfile = withProfile(pendingAppointments);

        // Get stats
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const [totalThisMonth, completedThisMonth, totalPatients] = await Promise.all([
            Appointment.countDocuments({
                doctorId: doctor._id,
                appointmentDate: { $gte: startOfMonth }
            }),
            Appointment.countDocuments({
                doctorId: doctor._id,
                appointmentDate: { $gte: startOfMonth },
                status: 'completed'
            }),
            Appointment.distinct('patientId', { doctorId: doctor._id }).then(ids => ids.length)
        ]);

        res.json({
            success: true,
            data: {
                doctor: {
                    id: doctor._id,
                    fullName: doctor.fullName,
                    specialty: doctor.specialty,
                    avatar: doctor.avatar,
                    clinic: doctor.clinicId
                },
                todayAppointments: todayAppointmentsWithProfile,
                pendingAppointments: pendingAppointmentsWithProfile,
                stats: {
                    todayCount: todayAppointments.length,
                    pendingCount: pendingAppointments.length,
                    totalThisMonth,
                    completedThisMonth,
                    totalPatients
                }
            }
        });
    } catch (error) {
        console.error('Get doctor dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get doctor's appointments with filters
// @route   GET /api/doctors/my-appointments
// @access  Private (Doctor)
const getMyAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so bac si'
            });
        }

        const { page = 1, limit = 10, status, startDate, endDate } = req.query;
        const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

        let query = { doctorId: doctor._id };

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.appointmentDate = {};
            if (startDate) query.appointmentDate.$gte = new Date(startDate);
            if (endDate) query.appointmentDate.$lte = new Date(endDate);
        }

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .populate('patientId', 'email phone')
                .populate('clinicId', 'name address')
                .skip(skip)
                .limit(limitNum)
                .sort({ appointmentDate: -1, timeSlot: 1 }),
            Appointment.countDocuments(query)
        ]);

        // Get patient profiles for each appointment
        const patientIds = [...new Set(appointments.map(a => a.patientId?._id).filter(Boolean))];
        const profiles = await PatientProfile.find({ userId: { $in: patientIds } });
        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.userId.toString()] = p;
        });

        const appointmentsWithProfiles = appointments.map(apt => ({
            ...apt.toObject(),
            patientProfile: profileMap[apt.patientId?._id?.toString()] || null
        }));

        res.json({
            success: true,
            data: appointmentsWithProfiles,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get my appointments error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Update appointment status
// @route   PATCH /api/doctors/appointments/:id/status
// @access  Private (Doctor)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, notes, medications } = req.body;
        const validStatuses = ['confirmed', 'completed', 'cancelled', 'no_show'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Trang thai khong hop le'
            });
        }

        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so bac si'
            });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctorId: doctor._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay lich kham'
            });
        }

        // If completing, require medications
        if (status === 'completed') {
            if (!Array.isArray(medications) || medications.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Can nhap don thuoc khi hoan tat lich kham'
                });
            }
        }

        appointment.status = status;
        if (notes) appointment.notes = notes;
        await appointment.save();

        if (status === 'completed' && Array.isArray(medications) && medications.length > 0) {
            const medDocs = medications.map(med => ({
                patientId: appointment.patientId,
                appointmentId: appointment._id,
                prescribedBy: doctor._id,
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                instructions: med.instructions,
                startDate: med.startDate || appointment.appointmentDate,
                endDate: med.endDate || null,
                isActive: true
            }));
            await Medication.insertMany(medDocs);
        }

        res.json({
            success: true,
            data: appointment,
            message: 'Cap nhat trang thai lich kham thanh cong'
        });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get doctor's patients
// @route   GET /api/doctors/my-patients
// @access  Private (Doctor)
const getMyPatients = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so bac si'
            });
        }

        const { search } = req.query;

        // Get unique patient IDs from appointments
        const patientIds = await Appointment.distinct('patientId', { doctorId: doctor._id });

        // Get patient profiles
        let query = { userId: { $in: patientIds } };
        if (search) {
            query.fullName = { $regex: search, $options: 'i' };
        }

        const patients = await PatientProfile.find(query)
            .populate('userId', 'email phone')
            .sort({ fullName: 1 });

        // Get appointment count for each patient
        const patientsWithStats = await Promise.all(patients.map(async (patient) => {
            const appointmentCount = await Appointment.countDocuments({
                doctorId: doctor._id,
                patientId: patient.userId._id
            });
            const lastAppointment = await Appointment.findOne({
                doctorId: doctor._id,
                patientId: patient.userId._id
            }).sort({ appointmentDate: -1 });

            return {
                ...patient.toObject(),
                appointmentCount,
                lastAppointment: lastAppointment?.appointmentDate
            };
        }));

        res.json({
            success: true,
            data: patientsWithStats,
            total: patientsWithStats.length
        });
    } catch (error) {
        console.error('Get my patients error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get patient details with medical history
// @route   GET /api/doctors/patients/:id
// @access  Private (Doctor)
const getPatientDetails = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so bac si'
            });
        }

        // Verify this patient has appointments with this doctor
        const hasAppointment = await Appointment.findOne({
            doctorId: doctor._id,
            patientId: req.params.id
        });

        if (!hasAppointment) {
            return res.status(403).json({
                success: false,
                error: 'Ban khong co quyen truy cap benh nhan nay'
            });
        }

        const patient = await PatientProfile.findOne({ userId: req.params.id })
            .populate('userId', 'email phone');

        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay benh nhan'
            });
        }

        // Get medical records
        const medicalRecords = await MedicalRecord.find({ patientId: req.params.id })
            .populate('doctorId', 'fullName specialty')
            .sort({ visitDate: -1 })
            .limit(20);

        // Get appointment history with this doctor
        const appointments = await Appointment.find({
            doctorId: doctor._id,
            patientId: req.params.id
        })
            .populate('clinicId', 'name')
            .sort({ appointmentDate: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                patient,
                medicalRecords,
                appointments
            }
        });
    } catch (error) {
        console.error('Get patient details error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Update doctor's own profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor)
const updateDoctorProfile = async (req, res) => {
    try {
        const { fullName, specialty, education, experience, description, avatar } = req.body;

        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so bac si'
            });
        }

        // Update fields
        if (fullName) doctor.fullName = fullName;
        if (specialty) doctor.specialty = specialty;
        if (education) doctor.education = education;
        if (experience !== undefined) doctor.experience = experience;
        if (description) doctor.description = description;
        if (avatar) doctor.avatar = avatar;

        await doctor.save();

        res.json({
            success: true,
            data: doctor,
            message: 'Cap nhat ho so bac si thanh cong'
        });
    } catch (error) {
        console.error('Update doctor profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Create medical record with prescriptions
// @route   POST /api/doctors/records
// @access  Private (Doctor)
const createMedicalRecord = async (req, res) => {
    try {
        const {
            patientId,
            appointmentId,
            diagnosis,
            symptoms,
            treatment,
            doctorNotes,
            vitalSigns,
            prescriptions
        } = req.body;

        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so bac si'
            });
        }

        // Validate required fields
        if (!patientId || !diagnosis) {
            return res.status(400).json({
                success: false,
                error: 'Can co ma benh nhan va chan doan'
            });
        }

        // Create the medical record
        const medicalRecord = await MedicalRecord.create({
            patientId,
            appointmentId,
            doctorId: doctor._id,
            diagnosis,
            symptoms: symptoms || '',
            treatment: treatment || '',
            doctorNotes: doctorNotes || '',
            vitalSigns: vitalSigns || {},
            prescriptions: prescriptions || [],
            recordDate: new Date()
        });

        // If appointment provided, mark it as completed
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                status: 'completed'
            });
        }

        res.status(201).json({
            success: true,
            data: medicalRecord,
            message: 'Tao ho so benh an thanh cong'
        });
    } catch (error) {
        console.error('Create medical record error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

module.exports = {
    getDoctors,
    getDoctorById,
    getDoctorDashboard,
    getMyAppointments,
    updateAppointmentStatus,
    getMyPatients,
    getPatientDetails,
    updateDoctorProfile,
    createMedicalRecord
};
