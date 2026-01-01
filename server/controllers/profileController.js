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
            error: 'Server error'
        });
    }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { fullName, dateOfBirth, gender, bloodType, allergies, emergencyContact, emergencyPhone, address, phone } = req.body;

        // Update user phone if provided
        if (phone) {
            await User.findByIdAndUpdate(req.user._id, { phone });
        }

        // Update or create profile
        let profile = await PatientProfile.findOne({ userId: req.user._id });

        if (profile) {
            profile = await PatientProfile.findOneAndUpdate(
                { userId: req.user._id },
                {
                    fullName: fullName || profile.fullName,
                    dateOfBirth: dateOfBirth || profile.dateOfBirth,
                    gender: gender || profile.gender,
                    bloodType: bloodType || profile.bloodType,
                    allergies: allergies || profile.allergies,
                    emergencyContact: emergencyContact || profile.emergencyContact,
                    emergencyPhone: emergencyPhone || profile.emergencyPhone,
                    address: address || profile.address
                },
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
                address
            });
            profile = await PatientProfile.findById(profile._id).populate('userId', 'email phone role');
        }

        res.json({
            success: true,
            data: profile,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
                error: 'Avatar URL is required'
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
                error: 'Profile not found'
            });
        }

        res.json({
            success: true,
            data: profile,
            message: 'Avatar updated successfully'
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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
                error: 'Profile not found'
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
            error: 'Server error'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    getProfileById
};
