import { useState, useEffect } from 'react';
import { appointmentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    X,
    ChevronRight,
    Plus,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle,
    Stethoscope
} from 'lucide-react';

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const { success, error: showError } = useToast();

    const filters = [
        { value: 'all', label: 'Tất cả', count: appointments.length },
        { value: 'scheduled', label: 'Chờ xác nhận', color: 'bg-amber-500' },
        { value: 'confirmed', label: 'Đã xác nhận', color: 'bg-blue-500' },
        { value: 'completed', label: 'Hoàn thành', color: 'bg-green-500' },
        { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-500' },
    ];

    useEffect(() => {
        fetchAppointments();
    }, [filter]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await appointmentService.getAppointments(params);
            if (response.success) {
                setAppointments(response.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (apt) => {
        setSelectedAppointment(apt);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedAppointment) return;

        setCancelling(true);
        try {
            await appointmentService.deleteAppointment(selectedAppointment._id);
            success('Lịch hẹn đã được hủy thành công');
            setShowCancelModal(false);
            setSelectedAppointment(null);
            fetchAppointments();
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể hủy lịch hẹn');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            scheduled: { label: 'Chờ xác nhận', icon: AlertCircle, bgClass: 'bg-amber-100 text-amber-800' },
            confirmed: { label: 'Đã xác nhận', icon: CheckCircle, bgClass: 'bg-blue-100 text-blue-800' },
            completed: { label: 'Hoàn thành', icon: CheckCircle, bgClass: 'bg-green-100 text-green-800' },
            cancelled: { label: 'Đã hủy', icon: XCircle, bgClass: 'bg-red-100 text-red-800' },
            in_progress: { label: 'Đang khám', icon: Clock, bgClass: 'bg-indigo-100 text-indigo-800' },
        };
        return configs[status] || { label: status, icon: AlertCircle, bgClass: 'bg-gray-100 text-gray-800' };
    };

    const getBorderColor = (status) => {
        const colors = {
            scheduled: 'border-l-amber-500',
            confirmed: 'border-l-blue-500',
            completed: 'border-l-green-500',
            cancelled: 'border-l-red-500',
            in_progress: 'border-l-indigo-500',
        };
        return colors[status] || 'border-l-gray-500';
    };

    const canCancel = (status) => ['scheduled', 'confirmed'].includes(status);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="mb-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Lịch khám của tôi</h1>
                    <p className="text-gray-500">Quản lý các cuộc hẹn khám bệnh</p>
                </div>
                <Link
                    to="/booking"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    Đặt lịch mới
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f.value
                            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-200'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {f.color && (
                            <span className={`w-2 h-2 rounded-full ${f.color}`} />
                        )}
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Đang tải...</p>
                    </div>
                </div>
            ) : appointments.length > 0 ? (
                <div className="space-y-4">
                    {appointments.map((apt, index) => {
                        const statusConfig = getStatusConfig(apt.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <div
                                key={apt._id}
                                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 sm:p-6 border-l-4 ${getBorderColor(apt.status)}`}
                                style={{ animation: `fadeIn 0.4s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Doctor Avatar */}
                                    <div className="flex items-center sm:items-start gap-4 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
                                            <Stethoscope className="w-7 h-7 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {apt.doctorId?.fullName || 'Bác sĩ'}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-0.5">
                                                {apt.doctorId?.specialty || 'Chuyên khoa'}
                                            </p>

                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">{formatDate(apt.appointmentDate)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">{apt.timeSlot}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 text-blue-500" />
                                                    <span className="line-clamp-1">{apt.clinicId?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex sm:flex-col items-center sm:items-end gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bgClass}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {statusConfig.label}
                                        </span>

                                        {canCancel(apt.status) && (
                                            <button
                                                onClick={() => handleCancelClick(apt)}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Hủy lịch
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Reason */}
                                {apt.reason && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium text-gray-700">Lý do khám:</span> {apt.reason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {filter === 'all' ? 'Chưa có lịch khám' : `Không có lịch ${filters.find(f => f.value === filter)?.label.toLowerCase()}`}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Đặt lịch khám ngay để chăm sóc sức khỏe của bạn
                    </p>
                    <Link
                        to="/booking"
                        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Plus className="w-5 h-5" />
                        Đặt lịch ngay
                    </Link>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                    onClick={() => setShowCancelModal(false)}
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Xác nhận hủy lịch?
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Bạn có chắc muốn hủy lịch khám với{' '}
                                <span className="font-semibold text-gray-700">
                                    {selectedAppointment?.doctorId?.fullName}
                                </span>{' '}
                                vào{' '}
                                <span className="font-semibold text-gray-700">
                                    {selectedAppointment && formatDate(selectedAppointment.appointmentDate)}
                                </span>
                                ?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                disabled={cancelling}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-500/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {cancelling ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <X className="w-5 h-5" />
                                        Xác nhận hủy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
