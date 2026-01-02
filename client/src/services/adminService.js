import api from './api';

export const adminService = {
    // Dashboard
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    // User Management
    getUsers: async (params) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    getUserById: async (id) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    createUser: async (data) => {
        const response = await api.post('/admin/users', data);
        return response.data;
    },

    updateUser: async (id, data) => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    toggleUserStatus: async (id, isActive) => {
        const response = await api.patch(`/admin/users/${id}/status`, { isActive });
        return response.data;
    },

    // Doctor Management
    getDoctors: async (params) => {
        const response = await api.get('/admin/doctors', { params });
        return response.data;
    },

    getDoctorById: async (id) => {
        const response = await api.get(`/admin/doctors/${id}`);
        return response.data;
    },

    createDoctor: async (data) => {
        const response = await api.post('/admin/doctors', data);
        return response.data;
    },

    updateDoctor: async (id, data) => {
        const response = await api.put(`/admin/doctors/${id}`, data);
        return response.data;
    },

    deleteDoctor: async (id) => {
        const response = await api.delete(`/admin/doctors/${id}`);
        return response.data;
    },

    toggleDoctorAvailability: async (id, isAvailable) => {
        const response = await api.patch(`/admin/doctors/${id}/availability`, { isAvailable });
        return response.data;
    },

    // Clinic Management
    getClinics: async (params) => {
        const response = await api.get('/admin/clinics', { params });
        return response.data;
    },

    getClinicById: async (id) => {
        const response = await api.get(`/admin/clinics/${id}`);
        return response.data;
    },

    createClinic: async (data) => {
        const response = await api.post('/admin/clinics', data);
        return response.data;
    },

    updateClinic: async (id, data) => {
        const response = await api.put(`/admin/clinics/${id}`, data);
        return response.data;
    },

    deleteClinic: async (id) => {
        const response = await api.delete(`/admin/clinics/${id}`);
        return response.data;
    },

    toggleClinicStatus: async (id, isActive) => {
        const response = await api.patch(`/admin/clinics/${id}/status`, { isActive });
        return response.data;
    },

    // Appointment Management
    getAppointments: async (params) => {
        const response = await api.get('/admin/appointments', { params });
        return response.data;
    },

    getAppointmentById: async (id) => {
        const response = await api.get(`/admin/appointments/${id}`);
        return response.data;
    },

    updateAppointmentStatus: async (id, status) => {
        const response = await api.patch(`/admin/appointments/${id}/status`, { status });
        return response.data;
    },

    // Reports
    getOverviewReport: async (params) => {
        const response = await api.get('/admin/reports/overview', { params });
        return response.data;
    },

    getAppointmentReport: async (params) => {
        const response = await api.get('/admin/reports/appointments', { params });
        return response.data;
    }
};
