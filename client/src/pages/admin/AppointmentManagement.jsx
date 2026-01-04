import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { clinicService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    User,
    Stethoscope,
    Building2,
    Filter,
    X
} from 'lucide-react';

const statusConfig = {
    pending: { label: 'Cho xac nhan', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    confirmed: { label: 'Da xac nhan', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
    completed: { label: 'Hoan thanh', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
    cancelled: { label: 'Da huy', color: 'bg-red-500/20 text-red-400', icon: XCircle }
};

export default function AppointmentManagement() {
    const [appointments, setAppointments] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [filters, setFilters] = useState({ status: '', clinicId: '', dateFrom: '', dateTo: '' });
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const { success, error: showError } = useToast();
    const record = selectedAppointment?.medicalRecords?.[0];

    useEffect(() => {
        fetchAppointments();
        fetchClinics();
    }, [pagination.page, filters]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAppointments({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });
            if (response.success) {
                setAppointments(response.data.appointments);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showError('Khong the tai danh sach lich hen');
        } finally {
            setLoading(false);
        }
    };

    const fetchClinics = async () => {
        try {
            const response = await clinicService.getClinics({ limit: 100 });
            if (response.success) {
                setClinics(response.data?.clinics || response.data || []);
            }
        } catch (error) {
            console.error('Error fetching clinics:', error);
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            const response = await adminService.updateAppointmentStatus(appointmentId, newStatus);
            if (response.success) {
                success(`Da cap nhat trang thai thanh ${statusConfig[newStatus].label}`);
                fetchAppointments();
            }
        } catch (error) {
            showError('Khong the cap nhat trang thai');
        }
    };

    const handleViewAppointment = async (appointment) => {
        try {
            const response = await adminService.getAppointmentById(appointment._id);
            if (response.success) {
                const data = response.data;
                const detail = data?.appointment ? {
                    ...data.appointment,
                    patientProfile: data.patientProfile,
                    medications: data.medications,
                    healthMetrics: data.healthMetrics,
                    medicalRecords: data.medicalRecords
                } : data;
                setSelectedAppointment(detail);
                setShowModal(true);
            }
        } catch (error) {
            showError('Khong the tai thong tin lich hen');
        }
    };

    const resetFilters = () => {
        setFilters({ status: '', clinicId: '', dateFrom: '', dateTo: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Quan ly lich hen</h1>
                    <p className="text-slate-400 mt-1">Theo doi va quan ly tat ca lich hen</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${showFilters ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    <Filter className="w-5 h-5" />
                    Bo loc
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Tat ca trang thai</option>
                            {Object.entries(statusConfig).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.clinicId}
                            onChange={(e) => setFilters(prev => ({ ...prev, clinicId: e.target.value }))}
                            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Tat ca phong kham</option>
                            {clinics.map(clinic => (
                                <option key={clinic._id} value={clinic._id}>{clinic.name}</option>
                            ))}
                        </select>
                        <div>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Tu ngay"
                            />
                        </div>
                        <div>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Den ngay"
                            />
                        </div>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2.5 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-500 transition-colors"
                        >
                            Dat lai
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statusConfig).map(([key, config]) => {
                    const count = appointments.filter(a => a.status === key).length;
                    const Icon = config.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setFilters(prev => ({ ...prev, status: prev.status === key ? '' : key }))}
                            className={`p-4 rounded-2xl border transition-all ${filters.status === key ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-2xl font-bold text-white">{count}</p>
                                    <p className="text-sm text-slate-400">{config.label}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Benh nhan</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Bac si</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Phong kham</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Ngay hen</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Trang thai</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-300">Hanh dong</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        Khong tim thay lich hen nao
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((apt) => {
                                    const config = statusConfig[apt.status] || statusConfig.pending;
                                    const StatusIcon = config.icon;
                                    return (
                                        <tr key={apt._id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {apt.patientProfile?.avatar ? (
                                                        <img
                                                            src={apt.patientProfile.avatar}
                                                            alt={apt.patientProfile.fullName || 'Benh nhan'}
                                                            className="w-10 h-10 rounded-xl object-cover border border-slate-700/70"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                                                            {apt.patientProfile?.fullName?.charAt(0) || apt.patientId?.email?.charAt(0) || 'P'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            {apt.patientProfile?.fullName || apt.patientId?.email?.split('@')[0] || 'N/A'}
                                                        </p>
                                                        <p className="text-slate-400 text-sm">{apt.patientId?.phone || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    {apt.doctorId?.avatar ? (
                                                        <img
                                                            src={apt.doctorId.avatar}
                                                            alt={apt.doctorId.fullName || 'Bac si'}
                                                            className="w-8 h-8 rounded-xl object-cover border border-slate-700/70"
                                                        />
                                                    ) : (
                                                        <Stethoscope className="w-4 h-4 text-teal-400" />
                                                    )}
                                                    <span className="text-slate-300">{apt.doctorId?.fullName || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-purple-400" />
                                                    <span className="text-slate-300">{apt.doctorId?.clinicId?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-orange-400" />
                                                    <div>
                                                        <p className="text-white">{formatDate(apt.date)}</p>
                                                        <p className="text-slate-400 text-sm">{apt.time}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${config.color}`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewAppointment(apt)}
                                                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                        title="Xem chi tiet"
                                                    >
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    {apt.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(apt._id, 'confirmed')}
                                                                className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                                                title="Xac nhan"
                                                            >
                                                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(apt._id, 'cancelled')}
                                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                                title="Huy"
                                                            >
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleStatusChange(apt._id, 'completed')}
                                                            className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                                            title="Hoan thanh"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                    <p className="text-sm text-slate-400">
                        Hien thi {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} lich hen
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 py-2 text-white">
                            {pagination.page} / {pagination.totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <h3 className="text-xl font-semibold text-white">Chi tiet lich hen</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">Benh nhan</p>
                                    <p className="text-white font-medium">
                                        {selectedAppointment.patientProfile?.fullName || selectedAppointment.patientId?.email || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Bac si</p>
                                    <p className="text-white font-medium">
                                        {selectedAppointment.doctorId?.fullName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Ngay hen</p>
                                    <p className="text-white font-medium">
                                        {formatDate(selectedAppointment.appointmentDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Gio hen</p>
                                    <p className="text-white font-medium">
                                        {selectedAppointment.timeSlot}
                                    </p>
                                </div>
                            </div>

                            {(record?.symptoms || selectedAppointment.symptoms) && (
                                <div>
                                    <p className="text-sm text-slate-400">Trieu chung</p>
                                    <p className="text-white">{record?.symptoms || selectedAppointment.symptoms}</p>
                                </div>
                            )}

                            {record?.treatment && (
                                <div>
                                    <p className="text-sm text-slate-400">Phuong phap dieu tri</p>
                                    <p className="text-white">{record.treatment}</p>
                                </div>
                            )}

                            {record?.doctorNotes && (
                                <div>
                                    <p className="text-sm text-slate-400">Ghi chu bac si</p>
                                    <p className="text-white whitespace-pre-line">{record.doctorNotes}</p>
                                </div>
                            )}

                            {selectedAppointment.notes && !record?.doctorNotes && (
                                <div>
                                    <p className="text-sm text-slate-400">Ghi chu</p>
                                    <p className="text-white">{selectedAppointment.notes}</p>
                                </div>
                            )}

                            {/* Medications */}
                            {selectedAppointment.medications?.length > 0 && (
                                <div className="pt-3 border-t border-slate-700">
                                    <p className="text-sm font-semibold text-white mb-2">Don thuoc</p>
                                    <div className="space-y-2">
                                        {selectedAppointment.medications.map(med => (
                                            <div key={med._id} className="p-3 rounded-xl bg-slate-700/40 border border-slate-700/70">
                                                <p className="text-white font-semibold">{med.name}</p>
                                                {med.dosage && <p className="text-sm text-slate-300">{med.dosage}</p>}
                                                {med.frequency && <p className="text-sm text-slate-400">{med.frequency}</p>}
                                                {med.instructions && <p className="text-xs text-slate-400 mt-1">{med.instructions}</p>}
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {med.startDate ? new Date(med.startDate).toLocaleDateString('vi-VN') : ''}{med.endDate ? ` - ${new Date(med.endDate).toLocaleDateString('vi-VN')}` : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Health Metrics */}
                            {selectedAppointment.healthMetrics && Object.keys(selectedAppointment.healthMetrics).length > 0 && (
                                <div className="pt-3 border-t border-slate-700">
                                    <p className="text-sm font-semibold text-white mb-2">Chi so suc khoe (moi nhat)</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(selectedAppointment.healthMetrics).map(([key, metric]) => (
                                            <div key={key} className="p-3 rounded-xl bg-slate-700/40 border border-slate-700/70">
                                                <p className="text-sm text-slate-300 capitalize">{key.replace('_', ' ')}</p>
                                                <p className="text-white font-semibold">
                                                    {metric.value}{metric.unit ? ` ${metric.unit}` : ''}{metric.secondaryValue ? ` / ${metric.secondaryValue}` : ''}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {metric.measuredAt ? new Date(metric.measuredAt).toLocaleString('vi-VN') : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
