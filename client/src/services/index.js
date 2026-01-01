import api from './api';

export const authService = {
    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.success) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },
};

export const profileService = {
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/profile', data);
        return response.data;
    },

    uploadAvatar: async (avatarUrl) => {
        const response = await api.post('/profile/avatar', { avatarUrl });
        return response.data;
    },
};

export const clinicService = {
    getClinics: async (params) => {
        const response = await api.get('/clinics', { params });
        return response.data;
    },

    getClinicById: async (id) => {
        const response = await api.get(`/clinics/${id}`);
        return response.data;
    },

    searchClinics: async (params) => {
        const response = await api.get('/clinics/search', { params });
        return response.data;
    },

    getAvailableSlots: async (clinicId, date, doctorId) => {
        const response = await api.get(`/clinics/${clinicId}/available-slots`, {
            params: { date, doctorId },
        });
        return response.data;
    },
};

export const doctorService = {
    getDoctors: async (params) => {
        const response = await api.get('/doctors', { params });
        return response.data;
    },

    getDoctorById: async (id) => {
        const response = await api.get(`/doctors/${id}`);
        return response.data;
    },

    getDoctorDashboard: async () => {
        const response = await api.get('/doctors/dashboard');
        return response.data;
    },
};

export const appointmentService = {
    getAppointments: async (params) => {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    getAppointmentById: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },

    createAppointment: async (data) => {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    updateAppointment: async (id, data) => {
        const response = await api.put(`/appointments/${id}`, data);
        return response.data;
    },

    cancelAppointment: async (id, reason) => {
        const response = await api.delete(`/appointments/${id}`, {
            data: { reason },
        });
        return response.data;
    },

    getUpcomingAppointments: async () => {
        const response = await api.get('/appointments/upcoming');
        return response.data;
    },

    confirmAppointment: async (id) => {
        const response = await api.post(`/appointments/${id}/confirm`);
        return response.data;
    },

    completeAppointment: async (id, notes) => {
        const response = await api.post(`/appointments/${id}/complete`, { notes });
        return response.data;
    },
};

export const medicalRecordService = {
    getMedicalRecords: async (params) => {
        const response = await api.get('/records', { params });
        return response.data;
    },

    getMedicalRecordById: async (id) => {
        const response = await api.get(`/records/${id}`);
        return response.data;
    },

    createMedicalRecord: async (data) => {
        const response = await api.post('/records', data);
        return response.data;
    },

    updateMedicalRecord: async (id, data) => {
        const response = await api.put(`/records/${id}`, data);
        return response.data;
    },

    deleteMedicalRecord: async (id) => {
        const response = await api.delete(`/records/${id}`);
        return response.data;
    },
};

export const medicationService = {
    getMedications: async (params) => {
        const response = await api.get('/medications', { params });
        return response.data;
    },

    getMedicationById: async (id) => {
        const response = await api.get(`/medications/${id}`);
        return response.data;
    },

    createMedication: async (data) => {
        const response = await api.post('/medications', data);
        return response.data;
    },

    updateMedication: async (id, data) => {
        const response = await api.put(`/medications/${id}`, data);
        return response.data;
    },

    deleteMedication: async (id) => {
        const response = await api.delete(`/medications/${id}`);
        return response.data;
    },

    createReminder: async (medicationId, data) => {
        const response = await api.post(`/medications/${medicationId}/reminders`, data);
        return response.data;
    },
};

export const reminderService = {
    getTodayReminders: async () => {
        const response = await api.get('/reminders/today');
        return response.data;
    },

    updateReminder: async (id, data) => {
        const response = await api.put(`/reminders/${id}`, data);
        return response.data;
    },

    markReminderTaken: async (id) => {
        const response = await api.post(`/reminders/${id}/taken`);
        return response.data;
    },
};

export const healthMetricService = {
    getHealthMetrics: async (params) => {
        const response = await api.get('/health-metrics', { params });
        return response.data;
    },

    createHealthMetric: async (data) => {
        const response = await api.post('/health-metrics', data);
        return response.data;
    },

    getHealthMetricTrends: async (params) => {
        const response = await api.get('/health-metrics/trends', { params });
        return response.data;
    },

    getLatestMetrics: async () => {
        const response = await api.get('/health-metrics/latest');
        return response.data;
    },
};

export const reportService = {
    getDashboardOverview: async () => {
        const response = await api.get('/reports/dashboard');
        return response.data;
    },

    getMedicationAdherenceReport: async (params) => {
        const response = await api.get('/reports/medication-adherence', { params });
        return response.data;
    },

    getMetricTrendsReport: async (params) => {
        const response = await api.get('/reports/metric-trends', { params });
        return response.data;
    },

    getAppointmentsReport: async (params) => {
        const response = await api.get('/reports/appointments', { params });
        return response.data;
    },
};
