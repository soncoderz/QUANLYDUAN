const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { paginate, paginateResponse } = require('../utils/helpers');

// @desc    Get medical records
// @route   GET /api/records
// @access  Private
const getMedicalRecords = async (req, res) => {
    try {
        const { page = 1, limit = 10, patientId } = req.query;
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
            // If patientId is provided, doctor can view that patient's records
            if (patientId) {
                query.patientId = patientId;
            }
        } else if (patientId) {
            query.patientId = patientId;
        }

        const [records, total] = await Promise.all([
            MedicalRecord.find(query)
                .populate('patientId', 'email phone')
                .populate('doctorId', 'fullName specialty')
                .populate('appointmentId', 'appointmentDate type')
                .skip(skip)
                .limit(limitNum)
                .sort({ recordDate: -1 }),
            MedicalRecord.countDocuments(query)
        ]);

        res.json({
            success: true,
            ...paginateResponse(records, total, pageNum, limitNum)
        });
    } catch (error) {
        console.error('Get medical records error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Get medical record by ID
// @route   GET /api/records/:id
// @access  Private
const getMedicalRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate('patientId', 'email phone')
            .populate('doctorId', 'fullName specialty')
            .populate('appointmentId', 'appointmentDate type reason symptoms');

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Medical record not found'
            });
        }

        // Check access
        if (req.user.role === 'patient' && record.patientId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this record'
            });
        }

        res.json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('Get medical record by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Create medical record (Doctor only)
// @route   POST /api/records
// @access  Private (Doctor)
const createMedicalRecord = async (req, res) => {
    try {
        const { patientId, appointmentId, diagnosis, treatment, doctorNotes, symptoms, vitalSigns } = req.body;

        // Get doctor
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) {
            return res.status(403).json({
                success: false,
                error: 'Only doctors can create medical records'
            });
        }

        const record = await MedicalRecord.create({
            patientId,
            appointmentId,
            doctorId: doctor._id,
            diagnosis,
            treatment,
            doctorNotes,
            symptoms,
            vitalSigns
        });

        // If linked to appointment, update appointment status
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, {
                status: 'completed',
                completedAt: new Date()
            });
        }

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate('patientId', 'email phone')
            .populate('doctorId', 'fullName specialty')
            .populate('appointmentId', 'appointmentDate type');

        res.status(201).json({
            success: true,
            data: populatedRecord,
            message: 'Medical record created successfully'
        });
    } catch (error) {
        console.error('Create medical record error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Update medical record (Doctor only)
// @route   PUT /api/records/:id
// @access  Private (Doctor)
const updateMedicalRecord = async (req, res) => {
    try {
        let record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Medical record not found'
            });
        }

        // Only the doctor who created can update
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor || record.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this record'
            });
        }

        record = await MedicalRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('patientId', 'email phone')
            .populate('doctorId', 'fullName specialty')
            .populate('appointmentId', 'appointmentDate type');

        res.json({
            success: true,
            data: record,
            message: 'Medical record updated successfully'
        });
    } catch (error) {
        console.error('Update medical record error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// @desc    Delete medical record (Doctor only)
// @route   DELETE /api/records/:id
// @access  Private (Doctor)
const deleteMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Medical record not found'
            });
        }

        // Only the doctor who created can delete
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor || record.doctorId.toString() !== doctor._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this record'
            });
        }

        await record.deleteOne();

        res.json({
            success: true,
            message: 'Medical record deleted successfully'
        });
    } catch (error) {
        console.error('Delete medical record error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

module.exports = {
    getMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
};
