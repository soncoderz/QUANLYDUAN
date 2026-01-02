const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        let profile = await PatientProfile.findOne({ userId: req.user._id }).populate('userId', 'email phone role');

        if (!profile) {
            // Create profile if not exists
            profile = await PatientProfile.create({
                userId: req.user._id,
                fullName: req.user.email.split('@')[0]
            });
            profile = await PatientProfile.findById(profile._id).populate('userId', 'email phone role');
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { fullName, dateOfBirth, gender, bloodType, allergies, emergencyContact, emergencyPhone, address, phone, avatar } = req.body;

        // Update user phone if provided
        if (phone) {
            await User.findByIdAndUpdate(req.user._id, { phone });
        }

        // Update or create profile
        let profile = await PatientProfile.findOne({ userId: req.user._id });

        if (profile) {
            const updateData = {};
            if (fullName) updateData.fullName = fullName;
            if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
            if (gender) updateData.gender = gender;
            if (bloodType) updateData.bloodType = bloodType;
            if (allergies) updateData.allergies = allergies;
            if (emergencyContact) updateData.emergencyContact = emergencyContact;
            if (emergencyPhone) updateData.emergencyPhone = emergencyPhone;
            if (address) updateData.address = address;
            if (avatar) updateData.avatar = avatar;

            profile = await PatientProfile.findOneAndUpdate(
                { userId: req.user._id },
                updateData,
                { new: true }
            ).populate('userId', 'email phone role');
        } else {
            profile = await PatientProfile.create({
                userId: req.user._id,
                fullName: fullName || req.user.email.split('@')[0],
                dateOfBirth,
                gender,
                bloodType,
                allergies,
                emergencyContact,
                emergencyPhone,
                address,
                avatar
            });
            profile = await PatientProfile.findById(profile._id).populate('userId', 'email phone role');
        }

        res.json({
            success: true,
            data: profile,
            message: 'Cap nhat ho so thanh cong'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        // In production, use multer to handle file upload
        // For now, accept URL
        const { avatarUrl } = req.body;

        if (!avatarUrl) {
            return res.status(400).json({
                success: false,
                error: 'Vui long cung cap link anh dai dien'
            });
        }

        const profile = await PatientProfile.findOneAndUpdate(
            { userId: req.user._id },
            { avatar: avatarUrl },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so'
            });
        }

        res.json({
            success: true,
            data: profile,
            message: 'Cap nhat anh dai dien thanh cong'
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get user profile by ID (Admin/Doctor)
// @route   GET /api/profile/:id
// @access  Private (Admin/Doctor)
const getProfileById = async (req, res) => {
    try {
        const profile = await PatientProfile.findOne({ userId: req.params.id }).populate('userId', 'email phone role');

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Khong tim thay ho so'
            });
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('Get profile by id error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    getProfileById
};
