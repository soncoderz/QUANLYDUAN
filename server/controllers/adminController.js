const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const Appointment = require('../models/Appointment');
const PatientProfile = require('../models/PatientProfile');
const MedicalRecord = require('../models/MedicalRecord');

// ==================== DASHBOARD ====================

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const [totalUsers, totalDoctors, totalClinics, totalAppointments] = await Promise.all([
            User.countDocuments(),
            Doctor.countDocuments(),
            Clinic.countDocuments(),
            Appointment.countDocuments()
        ]);

        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await Appointment.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        });

        // Get appointments by status
        const appointmentsByStatus = await Appointment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCounts = {
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0
        };
        appointmentsByStatus.forEach(item => {
            statusCounts[item._id] = item.count;
        });

        // Get user growth (this month vs last month)
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const [usersThisMonth, usersLastMonth] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: thisMonthStart } }),
            User.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } })
        ]);

        const growthRate = usersLastMonth > 0
            ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(2)
            : 100;

        // Get recent users
        const recentUsers = await User.find()
            .select('email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent appointments
        const recentAppointments = await Appointment.find()
            .populate('patientId', 'email')
            .populate('doctorId', 'fullName')
            .select('status createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Build recent activity
        const recentActivity = [
            ...recentUsers.map(user => ({
                type: 'user_registered',
                message: `User ${user.email} registered`,
                timestamp: user.createdAt
            })),
            ...recentAppointments.map(apt => ({
                type: 'appointment_created',
                message: `Appointment ${apt.status} - ${apt.doctorId?.fullName || 'Unknown Doctor'}`,
                timestamp: apt.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalDoctors,
                    totalClinics,
                    totalAppointments,
                    todayAppointments,
                    pendingAppointments: statusCounts.pending
                },
                userGrowth: {
                    thisMonth: usersThisMonth,
                    lastMonth: usersLastMonth,
                    growthRate: parseFloat(growthRate)
                },
                appointmentsByStatus: statusCounts,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching dashboard stats'
        });
    }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, status, search } = req.query;
        const query = {};

        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get profiles for patients
        const userIds = users.filter(u => u.role === 'patient').map(u => u._id);
        const profiles = await PatientProfile.find({ userId: { $in: userIds } });
        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.userId.toString()] = p;
        });

        const usersWithProfiles = users.map(user => ({
            ...user.toObject(),
            profile: profileMap[user._id.toString()] || null
        }));

        res.json({
            success: true,
            data: {
                users: usersWithProfiles,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching users'
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        let profile = null;
        if (user.role === 'patient') {
            profile = await PatientProfile.findOne({ userId: user._id });
        } else if (user.role === 'doctor') {
            profile = await Doctor.findOne({ userId: user._id }).populate('clinicId');
        }

        res.json({
            success: true,
            data: { user, profile }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching user'
        });
    }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { email, password, phone, role, fullName } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            phone,
            role: role || 'patient'
        });

        // Create profile based on role
        if (user.role === 'patient') {
            await PatientProfile.create({
                userId: user._id,
                fullName: fullName || email.split('@')[0],
                avatar: req.body.avatar || ''
            });
        }

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    isActive: user.isActive
                }
            },
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error creating user'
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { email, phone, role, isActive, fullName } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update user fields
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        await user.save();

        // Update profile if patient
        if (user.role === 'patient') {
            const updateData = {};
            if (fullName) updateData.fullName = fullName;
            if (req.body.avatar) updateData.avatar = req.body.avatar;

            if (Object.keys(updateData).length > 0) {
                await PatientProfile.findOneAndUpdate(
                    { userId: user._id },
                    updateData,
                    { new: true }
                );
            }
        }

        res.json({
            success: true,
            data: { user },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating user'
        });
    }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Soft delete - just deactivate
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error deleting user'
        });
    }
};

// @desc    Toggle user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user },
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating user status'
        });
    }
};

// ==================== DOCTOR MANAGEMENT ====================

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getDoctors = async (req, res) => {
    try {
        const { page = 1, limit = 10, clinicId, specialty, search } = req.query;
        const query = {};

        if (clinicId) query.clinicId = clinicId;
        if (specialty) query.specialty = { $regex: specialty, $options: 'i' };
        if (search) {
            query.fullName = { $regex: search, $options: 'i' };
        }

        const total = await Doctor.countDocuments(query);
        const doctors = await Doctor.find(query)
            .populate('userId', 'email phone isActive')
            .populate('clinicId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                doctors,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching doctors'
        });
    }
};

// @desc    Get doctor by ID
// @route   GET /api/admin/doctors/:id
// @access  Private/Admin
const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate('userId', 'email phone isActive')
            .populate('clinicId');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: { doctor }
        });
    } catch (error) {
        console.error('Get doctor by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching doctor'
        });
    }
};

// @desc    Create doctor (creates user + doctor profile)
// @route   POST /api/admin/doctors
// @access  Private/Admin
const createDoctor = async (req, res) => {
    try {
        const {
            email, password, phone,
            fullName, specialty, clinicId,
            licenseNumber, experience, education, consultationFee, description
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Create user account
        const user = await User.create({
            email,
            password,
            phone,
            role: 'doctor'
        });

        // Create doctor profile
        const doctor = await Doctor.create({
            userId: user._id,
            clinicId,
            fullName,
            specialty,
            licenseNumber,
            experience: experience || 0,
            education,
            description,
            consultationFee: consultationFee || 0,
            avatar: req.body.avatar || ''
        });

        res.status(201).json({
            success: true,
            data: { doctor },
            message: 'Doctor created successfully'
        });
    } catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error creating doctor'
        });
    }
};

// @desc    Update doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
const updateDoctor = async (req, res) => {
    try {
        const {
            fullName, specialty, clinicId,
            licenseNumber, experience, education, consultationFee, description, isAvailable
        } = req.body;

        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
                fullName, specialty, clinicId,
                licenseNumber, experience, education, consultationFee, description, isAvailable,
                avatar: req.body.avatar
            },
            { new: true, runValidators: true }
        ).populate('clinicId', 'name');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: { doctor },
            message: 'Doctor updated successfully'
        });
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating doctor'
        });
    }
};

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }

        // Deactivate user account
        await User.findByIdAndUpdate(doctor.userId, { isActive: false });

        // Mark doctor as unavailable
        doctor.isAvailable = false;
        await doctor.save();

        res.json({
            success: true,
            message: 'Doctor deactivated successfully'
        });
    } catch (error) {
        console.error('Delete doctor error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error deleting doctor'
        });
    }
};

// @desc    Toggle doctor availability
// @route   PATCH /api/admin/doctors/:id/availability
// @access  Private/Admin
const toggleDoctorAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            { isAvailable },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            data: { doctor },
            message: `Doctor ${isAvailable ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        console.error('Toggle doctor availability error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating doctor availability'
        });
    }
};

// ==================== CLINIC MANAGEMENT ====================

// @desc    Get all clinics
// @route   GET /api/admin/clinics
// @access  Private/Admin
const getClinics = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, specialty } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
        }
        if (specialty) {
            query.specialty = { $in: [specialty] };
        }

        const total = await Clinic.countDocuments(query);
        const clinics = await Clinic.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get doctor count for each clinic
        const clinicIds = clinics.map(c => c._id);
        const doctorCounts = await Doctor.aggregate([
            { $match: { clinicId: { $in: clinicIds } } },
            { $group: { _id: '$clinicId', count: { $sum: 1 } } }
        ]);
        const doctorCountMap = {};
        doctorCounts.forEach(d => {
            doctorCountMap[d._id.toString()] = d.count;
        });

        const clinicsWithDoctorCount = clinics.map(clinic => ({
            ...clinic.toObject(),
            doctorCount: doctorCountMap[clinic._id.toString()] || 0
        }));

        res.json({
            success: true,
            data: {
                clinics: clinicsWithDoctorCount,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get clinics error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching clinics'
        });
    }
};

// @desc    Get clinic by ID
// @route   GET /api/admin/clinics/:id
// @access  Private/Admin
const getClinicById = async (req, res) => {
    try {
        const clinic = await Clinic.findById(req.params.id);
        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Clinic not found'
            });
        }

        // Get doctors in this clinic
        const doctors = await Doctor.find({ clinicId: clinic._id })
            .populate('userId', 'email phone');

        res.json({
            success: true,
            data: { clinic, doctors }
        });
    } catch (error) {
        console.error('Get clinic by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching clinic'
        });
    }
};

// @desc    Create clinic
// @route   POST /api/admin/clinics
// @access  Private/Admin
const createClinic = async (req, res) => {
    try {
        const { name, address, phone, email, specialty, description, workingHours, image } = req.body;

        const clinic = await Clinic.create({
            name,
            address,
            phone,
            email,
            specialty: specialty || [],
            description,
            workingHours,
            image
        });

        res.status(201).json({
            success: true,
            data: { clinic },
            message: 'Clinic created successfully'
        });
    } catch (error) {
        console.error('Create clinic error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error creating clinic'
        });
    }
};

// @desc    Update clinic
// @route   PUT /api/admin/clinics/:id
// @access  Private/Admin
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
                error: 'Clinic not found'
            });
        }

        res.json({
            success: true,
            data: { clinic },
            message: 'Clinic updated successfully'
        });
    } catch (error) {
        console.error('Update clinic error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating clinic'
        });
    }
};

// @desc    Delete clinic (soft delete)
// @route   DELETE /api/admin/clinics/:id
// @access  Private/Admin
const deleteClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Clinic not found'
            });
        }

        res.json({
            success: true,
            message: 'Clinic deactivated successfully'
        });
    } catch (error) {
        console.error('Delete clinic error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error deleting clinic'
        });
    }
};

// @desc    Toggle clinic status
// @route   PATCH /api/admin/clinics/:id/status
// @access  Private/Admin
const toggleClinicStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const clinic = await Clinic.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );

        if (!clinic) {
            return res.status(404).json({
                success: false,
                error: 'Clinic not found'
            });
        }

        res.json({
            success: true,
            data: { clinic },
            message: `Clinic ${isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Toggle clinic status error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating clinic status'
        });
    }
};

// ==================== APPOINTMENT MANAGEMENT ====================

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
const getAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, clinicId, doctorId, dateFrom, dateTo } = req.query;
        const query = {};

        if (status) query.status = status;
        if (doctorId) query.doctorId = doctorId;
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(dateFrom);
            if (dateTo) query.date.$lte = new Date(dateTo);
        }

        // If clinicId provided, filter by doctors in that clinic
        if (clinicId) {
            const doctors = await Doctor.find({ clinicId }).select('_id');
            query.doctorId = { $in: doctors.map(d => d._id) };
        }

        const total = await Appointment.countDocuments(query);
        const appointments = await Appointment.find(query)
            .populate({
                path: 'patientId',
                select: 'email phone',
            })
            .populate({
                path: 'doctorId',
                select: 'fullName specialty',
                populate: { path: 'clinicId', select: 'name' }
            })
            .sort({ date: -1, time: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get patient profiles
        const patientIds = appointments.map(a => a.patientId?._id).filter(Boolean);
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
            data: {
                appointments: appointmentsWithProfiles,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching appointments'
        });
    }
};

// @desc    Get appointment by ID
// @route   GET /api/admin/appointments/:id
// @access  Private/Admin
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'email phone')
            .populate({
                path: 'doctorId',
                populate: { path: 'clinicId' }
            });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        // Get patient profile
        const profile = await PatientProfile.findOne({ userId: appointment.patientId._id });

        // Get medical records for this appointment
        const records = await MedicalRecord.find({ appointmentId: appointment._id });

        res.json({
            success: true,
            data: {
                appointment,
                patientProfile: profile,
                medicalRecords: records
            }
        });
    } catch (error) {
        console.error('Get appointment by ID error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching appointment'
        });
    }
};

// @desc    Update appointment status
// @route   PATCH /api/admin/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('patientId', 'email').populate('doctorId', 'fullName');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            data: { appointment },
            message: `Appointment ${status} successfully`
        });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error updating appointment status'
        });
    }
};

// ==================== REPORTS ====================

// @desc    Get system overview report
// @route   GET /api/admin/reports/overview
// @access  Private/Admin
const getOverviewReport = async (req, res) => {
    try {
        const { period = 'monthly', year = new Date().getFullYear() } = req.query;

        // Monthly statistics
        const monthlyStats = await Appointment.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // User registration by month
        const userStats = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format data for charts
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const appointmentData = months.map((month, idx) => ({
            month,
            count: monthlyStats.find(s => s._id === idx + 1)?.count || 0
        }));

        const userData = months.map((month, idx) => ({
            month,
            count: userStats.find(s => s._id === idx + 1)?.count || 0
        }));

        res.json({
            success: true,
            data: {
                year: parseInt(year),
                appointmentsByMonth: appointmentData,
                usersByMonth: userData
            }
        });
    } catch (error) {
        console.error('Get overview report error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching report'
        });
    }
};

// @desc    Get appointment statistics report
// @route   GET /api/admin/reports/appointments
// @access  Private/Admin
const getAppointmentReport = async (req, res) => {
    try {
        const { period = 'monthly', year = new Date().getFullYear(), clinicId } = req.query;

        let matchQuery = {
            createdAt: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            }
        };

        // Filter by clinic if provided
        if (clinicId) {
            const doctors = await Doctor.find({ clinicId }).select('_id');
            matchQuery.doctorId = { $in: doctors.map(d => d._id) };
        }

        // By status
        const byStatus = await Appointment.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // By specialty (through doctor)
        const bySpecialty = await Appointment.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'doctors',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            { $unwind: '$doctor' },
            { $group: { _id: '$doctor.specialty', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                byStatus,
                bySpecialty
            }
        });
    } catch (error) {
        console.error('Get appointment report error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching appointment report'
        });
    }
};

module.exports = {
    // Dashboard
    getDashboardStats,
    // Users
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    // Doctors
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    toggleDoctorAvailability,
    // Clinics
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    toggleClinicStatus,
    // Appointments
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    // Reports
    getOverviewReport,
    getAppointmentReport
};
