import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
    Calendar,
    Search,
    Filter,
    ChevronDown,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Mail,
    X
} from 'lucide-react';

export default function DoctorAppointments() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [pagination, setPagination] = useState({});
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { success, error: showError } = useToast();

    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        startDate: '',
        endDate: '',
        page: 1
    });

    useEffect(() => {
        fetchAppointments();
    }, [filters]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            params.append('page', filters.page);
            params.append('limit', 10);

            const response = await api.get(`/doctors/my-appointments?${params}`);
            if (response.data.success) {
                setAppointments(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showError('Không thể tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            const response = await api.patch(`/doctors/appointments/${appointmentId}/status`, {
                status: newStatus
            });
            if (response.data.success) {
                success('Cập nhật trạng thái thành công');
                fetchAppointments();
                setShowModal(false);
            }
        } catch (error) {
            showError('Không thể cập nhật trạng thái');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (slot) => {
        if (!slot) return '';
        return slot;
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
            cancelled: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            no_show: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: 'Đã lên lịch',
            confirmed: 'Đã xác nhận',
            pending: 'Chờ xử lý',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
            no_show: 'Không đến'
        };
        return labels[status] || status;
    };

    const statusOptions = [
        { value: '', label: 'Tất cả' },
        { value: 'scheduled', label: 'Đã lên lịch' },
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'pending', label: 'Chờ xử lý' },
        { value: 'completed', label: 'Hoàn thành' },
        { value: 'cancelled', label: 'Đã hủy' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Quản lý lịch hẹn</h1>
                    <p className="text-slate-400 mt-1">Xem và quản lý các cuộc hẹn của bạn</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Trạng thái</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Từ ngày</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Đến ngày</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: '', startDate: '', endDate: '', page: 1 })}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Appointments List */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="py-20 text-center">
                        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">Không có lịch hẹn nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700/50">
                        {appointments.map((apt) => (
                            <div
                                key={apt._id}
                                className="p-4 hover:bg-slate-700/30 transition-colors cursor-pointer"
                                onClick={() => {
                                    setSelectedAppointment(apt);
                                    setShowModal(true);
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    {apt.patientProfile?.avatar ? (
                                        <img
                                            src={apt.patientProfile.avatar}
                                            alt={apt.patientProfile.fullName || 'Bệnh nhân'}
                                            className="w-14 h-14 rounded-xl object-cover border border-teal-500/30"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                            <User className="w-6 h-6 text-teal-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white">
                                            {apt.patientProfile?.fullName || apt.patientId?.email || 'Bệnh nhân'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(apt.appointmentDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(apt.timeSlot)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                                        {getStatusLabel(apt.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Trang {pagination.page} / {pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="px-4 py-2 bg-slate-700/50 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="px-4 py-2 bg-slate-700/50 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Appointment Detail Modal */}
            {showModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Chi tiết lịch hẹn</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Patient Info */}
                            <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl">
                                {selectedAppointment.patientProfile?.avatar ? (
                                    <img
                                        src={selectedAppointment.patientProfile.avatar}
                                        alt={selectedAppointment.patientProfile.fullName || 'Bệnh nhân'}
                                        className="w-14 h-14 rounded-xl object-cover border border-teal-500/30"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                        <User className="w-6 h-6 text-teal-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-white">
                                        {selectedAppointment.patientProfile?.fullName || 'Bệnh nhân'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {selectedAppointment.patientId?.phone || 'N/A'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {selectedAppointment.patientId?.email || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Ngày hẹn</p>
                                    <p className="text-white font-medium">{formatDate(selectedAppointment.appointmentDate)}</p>
                                </div>
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Giờ hẹn</p>
                                    <p className="text-white font-medium">{formatTime(selectedAppointment.timeSlot)}</p>
                                </div>
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Phòng khám</p>
                                    <p className="text-white font-medium">{selectedAppointment.clinicId?.name || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Trạng thái</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                                        {getStatusLabel(selectedAppointment.status)}
                                    </span>
                                </div>
                            </div>

                            {selectedAppointment.reason && (
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Lý do khám</p>
                                    <p className="text-white">{selectedAppointment.reason}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {!['completed', 'cancelled'].includes(selectedAppointment.status) && (
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {selectedAppointment.status !== 'confirmed' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedAppointment._id, 'confirmed')}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Xác nhận
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStatusUpdate(selectedAppointment._id, 'completed')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl hover:bg-teal-500/30 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Hoàn thành
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedAppointment._id, 'cancelled')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Hủy
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
