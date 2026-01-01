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
    pending: { label: 'Chờ xác nhận', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500/20 text-red-400', icon: XCircle }
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
            showError('Không thể tải danh sách lịch hẹn');
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
                success(`Đã cập nhật trạng thái thành ${statusConfig[newStatus].label}`);
                fetchAppointments();
            }
        } catch (error) {
            showError('Không thể cập nhật trạng thái');
        }
    };

    const handleViewAppointment = async (appointment) => {
        try {
            const response = await adminService.getAppointmentById(appointment._id);
            if (response.success) {
                setSelectedAppointment(response.data);
                setShowModal(true);
            }
        } catch (error) {
            showError('Không thể tải thông tin lịch hẹn');
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Quản lý lịch hẹn</h1>
                    <p className="text-slate-400 mt-1">Theo dõi và quản lý tất cả lịch hẹn</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${showFilters ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                >
                    <Filter className="w-5 h-5" />
                    Bộ lọc
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
                            <option value="">Tất cả trạng thái</option>
                            {Object.entries(statusConfig).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                        <select
                            value={filters.clinicId}
                            onChange={(e) => setFilters(prev => ({ ...prev, clinicId: e.target.value }))}
                            className="px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Tất cả phòng khám</option>
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
                                placeholder="Từ ngày"
                            />
                        </div>
                        <div>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Đến ngày"
                            />
                        </div>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2.5 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-500 transition-colors"
                        >
                            Đặt lại
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
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Bệnh nhân</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Bác sĩ</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Phòng khám</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Ngày hẹn</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Trạng thái</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-300">Hành động</th>
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
                                        Không tìm thấy lịch hẹn nào
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
                                                        alt={apt.patientProfile.fullName || 'Bệnh nhân'}
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
                                                            alt={apt.doctorId.fullName || 'Bác sĩ'}
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
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                    {apt.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(apt._id, 'confirmed')}
                                                                className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                                                title="Xác nhận"
                                                            >
                                                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(apt._id, 'cancelled')}
                                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                                title="Hủy"
                                                            >
                                                                <XCircle className="w-4 h-4 text-red-400" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleStatusChange(apt._id, 'completed')}
                                                            className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                                            title="Hoàn thành"
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
                        Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} lịch hẹn
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
                            <h3 className="text-xl font-semibold text-white">Chi tiết lịch hẹn</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">Bệnh nhân</p>
                                    <p className="text-white font-medium">
                                        {selectedAppointment.patientProfile?.fullName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Bác sĩ</p>
                                    <p className="text-white font-medium">
                                        {selectedAppointment.appointment?.doctorId?.fullName || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Ngày hẹn</p>
                                    <p className="text-white font-medium">
                                        {formatDate(selectedAppointment.appointment?.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Giờ hẹn</p>
                                    <p className="text-white font-medium">
                                        {selectedAppointment.appointment?.time}
                                    </p>
                                </div>
                            </div>
                            {selectedAppointment.appointment?.symptoms && (
                                <div>
                                    <p className="text-sm text-slate-400">Triệu chứng</p>
                                    <p className="text-white">{selectedAppointment.appointment.symptoms}</p>
                                </div>
                            )}
                            {selectedAppointment.appointment?.notes && (
                                <div>
                                    <p className="text-sm text-slate-400">Ghi chú</p>
                                    <p className="text-white">{selectedAppointment.appointment.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
