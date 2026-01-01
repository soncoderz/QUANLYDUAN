const express = require('express');
const router = express.Router();
const { register, login, logout, refreshAccessToken, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { validate, schemas, authLimiter, protect } = require('../middleware');

// Rate limit auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
