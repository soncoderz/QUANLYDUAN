const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        next();
    };
};

// Validation schemas
const schemas = {
    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please enter a valid email',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        }),
        phone: Joi.string().allow(''),
        role: Joi.string().valid('patient', 'doctor', 'clinic_admin').default('patient'),
        fullName: Joi.string().required().messages({
            'any.required': 'Full name is required'
        })
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    updateProfile: Joi.object({
        fullName: Joi.string(),
        dateOfBirth: Joi.date(),
        gender: Joi.string().valid('male', 'female', 'other'),
        bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''),
        allergies: Joi.array().items(Joi.string()),
        emergencyContact: Joi.string().allow(''),
        emergencyPhone: Joi.string().allow(''),
        address: Joi.string().allow(''),
        phone: Joi.string().allow('')
    }),

    createAppointment: Joi.object({
        clinicId: Joi.string().required(),
        doctorId: Joi.string().required(),
        appointmentDate: Joi.date().required(),
        timeSlot: Joi.string().required(),
        type: Joi.string().valid('consultation', 'checkup', 'follow-up').default('consultation'),
        reason: Joi.string().allow(''),
        symptoms: Joi.string().allow('')
    }),

    updateAppointment: Joi.object({
        appointmentDate: Joi.date(),
        timeSlot: Joi.string(),
        type: Joi.string().valid('consultation', 'checkup', 'follow-up'),
        reason: Joi.string().allow(''),
        symptoms: Joi.string().allow(''),
        notes: Joi.string().allow('')
    }),

    createMedicalRecord: Joi.object({
        patientId: Joi.string().required(),
        appointmentId: Joi.string(),
        diagnosis: Joi.string().required(),
        treatment: Joi.string().allow(''),
        doctorNotes: Joi.string().allow(''),
        symptoms: Joi.string().allow(''),
        vitalSigns: Joi.object({
            bloodPressure: Joi.string().allow(''),
            heartRate: Joi.number(),
            temperature: Joi.number(),
            weight: Joi.number(),
            height: Joi.number()
        })
    }),

    createMedication: Joi.object({
        name: Joi.string().required(),
        dosage: Joi.string().allow(''),
        frequency: Joi.string().allow(''),
        instructions: Joi.string().allow(''),
        startDate: Joi.date().required(),
        endDate: Joi.date(),
        recordId: Joi.string()
    }),

    createReminder: Joi.object({
        reminderTime: Joi.string().required(),
        daysOfWeek: Joi.array().items(
            Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
        ),
        isActive: Joi.boolean().default(true)
    }),

    createHealthMetric: Joi.object({
        metricType: Joi.string().valid('weight', 'blood_pressure', 'glucose', 'heart_rate', 'temperature', 'oxygen_saturation').required(),
        value: Joi.number().required(),
        secondaryValue: Joi.number(),
        unit: Joi.string().required(),
        notes: Joi.string().allow(''),
        measuredAt: Joi.date()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(8).required()
    })
};

module.exports = { validate, schemas };
