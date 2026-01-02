const Medication = require('../models/Medication');
const Reminder = require('../models/Reminder');
const { paginate, paginateResponse } = require('../utils/helpers');

// @desc    Get medications
// @route   GET /api/medications
// @access  Private
const getMedications = async (req, res) => {
    try {
        const { page = 1, limit = 10, active } = req.query;
        const { skip, limit: limitNum, page: pageNum } = paginate(page, limit);

        let query = { patientId: req.user._id };
        if (active !== undefined) {
            query.isActive = active === 'true';
        }

        const [medications, total] = await Promise.all([
            Medication.find(query)
                .populate('prescribedBy', 'fullName specialty')
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            Medication.countDocuments(query)
        ]);

        // Get reminders for each medication
        const medicationsWithReminders = await Promise.all(
            medications.map(async (med) => {
                const reminders = await Reminder.find({ medicationId: med._id });
                return {
                    ...med.toObject(),
                    reminders
                };
            })
        );

        res.json({
            success: true,
            ...paginateResponse(medicationsWithReminders, total, pageNum, limitNum)
        });
    } catch (error) {
        console.error('Get medications error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get medication by ID
// @route   GET /api/medications/:id
// @access  Private
const getMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id)
            .populate('prescribedBy', 'fullName specialty');

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay thuoc'
            });
        }

        // Check access
        if (medication.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Khong co quyen truy cap'
            });
        }

        const reminders = await Reminder.find({ medicationId: medication._id });

        res.json({
            success: true,
            data: {
                ...medication.toObject(),
                reminders
            }
        });
    } catch (error) {
        console.error('Get medication by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Create medication
// @route   POST /api/medications
// @access  Private
const createMedication = async (req, res) => {
    try {
        const { name, dosage, frequency, instructions, startDate, endDate, recordId } = req.body;

        const medication = await Medication.create({
            patientId: req.user._id,
            name,
            dosage,
            frequency,
            instructions,
            startDate,
            endDate,
            recordId
        });

        res.status(201).json({
            success: true,
            data: medication,
            message: 'Them thuoc thanh cong'
        });
    } catch (error) {
        console.error('Create medication error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Update medication
// @route   PUT /api/medications/:id
// @access  Private
const updateMedication = async (req, res) => {
    try {
        let medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay thuoc'
            });
        }

        // Check access
        if (medication.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Khong co quyen truy cap'
            });
        }

        medication = await Medication.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: medication,
            message: 'Cap nhat thuoc thanh cong'
        });
    } catch (error) {
        console.error('Update medication error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private
const deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay thuoc'
            });
        }

        // Check access
        if (medication.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Khong co quyen truy cap'
            });
        }

        // Delete associated reminders
        await Reminder.deleteMany({ medicationId: medication._id });
        await medication.deleteOne();

        res.json({
            success: true,
            message: 'Xoa thuoc thanh cong'
        });
    } catch (error) {
        console.error('Delete medication error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Create reminder for medication
// @route   POST /api/medications/:id/reminders
// @access  Private
const createReminder = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay thuoc'
            });
        }

        // Check access
        if (medication.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Khong co quyen truy cap'
            });
        }

        const { reminderTime, daysOfWeek, isActive } = req.body;

        const reminder = await Reminder.create({
            medicationId: medication._id,
            patientId: req.user._id,
            reminderTime,
            daysOfWeek: daysOfWeek || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            isActive: isActive !== false
        });

        res.status(201).json({
            success: true,
            data: reminder,
            message: 'Tao nhac nho thanh cong'
        });
    } catch (error) {
        console.error('Create reminder error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
    try {
        let reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay nhac nho'
            });
        }

        // Check access
        if (reminder.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Khong co quyen truy cap'
            });
        }

        reminder = await Reminder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: reminder,
            message: 'Cap nhat nhac nho thanh cong'
        });
    } catch (error) {
        console.error('Update reminder error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Mark reminder as taken
// @route   POST /api/reminders/:id/taken
// @access  Private
const markReminderTaken = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);

        if (!reminder) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay nhac nho'
            });
        }

        // Check access
        if (reminder.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Khong co quyen truy cap'
            });
        }

        // Add to taken history
        reminder.takenHistory.push({
            date: new Date(),
            taken: true,
            takenAt: new Date()
        });
        reminder.lastTriggered = new Date();
        await reminder.save();

        res.json({
            success: true,
            data: reminder,
            message: 'Da danh dau da dung thuoc'
        });
    } catch (error) {
        console.error('Mark reminder taken error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get today's reminders
// @route   GET /api/reminders/today
// @access  Private
const getTodayReminders = async (req, res) => {
    try {
        const today = new Date();
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];

        const reminders = await Reminder.find({
            patientId: req.user._id,
            isActive: true,
            daysOfWeek: { $in: [dayOfWeek] }
        }).populate({
            path: 'medicationId',
            select: 'name dosage frequency instructions'
        });

        res.json({
            success: true,
            data: reminders
        });
    } catch (error) {
        console.error('Get today reminders error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

module.exports = {
    getMedications,
    getMedicationById,
    createMedication,
    updateMedication,
    deleteMedication,
    createReminder,
    updateReminder,
    markReminderTaken,
    getTodayReminders
};
