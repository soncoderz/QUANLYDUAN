const jwt = require('jsonwebtoken');

// Generate access token (15 minutes)
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );
};

// Generate refresh token (7 days)
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

// Generate random token for password reset
const generateResetToken = () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    generateResetToken
};
