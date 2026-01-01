const express = require('express');
const router = express.Router();
const {
    getMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
} = require('../controllers/medicalRecordController');
const { protect, authorize, validate, schemas } = require('../middleware');

// All routes require authentication
router.use(protect);

router.get('/', getMedicalRecords);
router.get('/:id', getMedicalRecordById);

// Doctor only routes
router.post('/', authorize('doctor'), validate(schemas.createMedicalRecord), createMedicalRecord);
router.put('/:id', authorize('doctor'), updateMedicalRecord);
router.delete('/:id', authorize('doctor'), deleteMedicalRecord);

module.exports = router;
