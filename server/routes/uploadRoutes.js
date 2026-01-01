const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const { protect } = require('../middleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        // Get folder from query or default to 'general'
        const folder = req.query.folder || 'healthcare/general';

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

        res.json({
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Error uploading image'
        });
    }
});

// @desc    Upload avatar (circular crop)
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary with avatar transformation
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'healthcare/avatars',
            resource_type: 'image',
            transformation: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                { quality: 'auto' }
            ]
        });

        res.json({
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id
            }
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Error uploading avatar'
        });
    }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, async (req, res) => {
    try {
        const { publicId } = req.params;

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Error deleting image'
        });
    }
});

module.exports = router;
