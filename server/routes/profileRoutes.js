const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar, getProfileById } = require('../controllers/profileController');
const { protect, authorize, validate, schemas } = require('../middleware');

// All routes require authentication
router.use(protect);

router.get('/', getProfile);
router.put('/', validate(schemas.updateProfile), updateProfile);
router.post('/avatar', uploadAvatar);

// Admin/Doctor can view other profiles
router.get('/:id', authorize('doctor', 'clinic_admin'), getProfileById);

module.exports = router;
