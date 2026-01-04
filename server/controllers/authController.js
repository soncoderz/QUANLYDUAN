const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateResetToken } = require('../utils/tokenUtils');
const { sendPasswordResetEmail } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { email, password, phone, role, fullName } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error: 'Email nay da duoc dang ky'
            });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            phone,
            role: role || 'patient'
        });

        // Create patient profile if role is patient
        if (user.role === 'patient') {
            await PatientProfile.create({
                userId: user._id,
                fullName
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                },
                accessToken,
                refreshToken
            },
            message: 'Dang ky thanh cong'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email hoac mat khau khong dung'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Tai khoan da bi khoa, vui long lien he ho tro'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Email hoac mat khau khong dung'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                },
                accessToken,
                refreshToken
            },
            message: 'Dang nhap thanh cong'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        // Clear refresh token
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

        res.json({
            success: true,
            message: 'Dang xuat thanh cong'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: 'Can co refresh token'
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token khong hop le hoac da het han'
            });
        }

        // Find user and check refresh token
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token khong hop le'
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken(user._id, user.role);

        res.json({
            success: true,
            data: { accessToken },
            message: 'Lay token moi thanh cong'
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if email exists
            return res.json({
                success: true,
                message: 'Neu email ton tai trong he thong, ban se nhan duoc huong dan dat lai mat khau'
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 300000; // 5 minutes
        await user.save();

        // Send password reset email via SendGrid
        try {
            await sendPasswordResetEmail(email, resetToken);
            console.log(`Password reset email sent to: ${email}`);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Reset the token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                error: 'Khong the gui email, vui long thu lai sau'
            });
        }

        res.json({
            success: true,
            message: 'Da gui email huong dan dat lai mat khau. Vui long kiem tra hop thu cua ban.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Ma reset khong hop le hoac da het han'
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Doi mat khau thanh cong'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -refreshToken');

        let profile = null;
        if (user.role === 'patient') {
            profile = await PatientProfile.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            error: 'Co loi he thong, vui long thu lai'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    getMe
};
