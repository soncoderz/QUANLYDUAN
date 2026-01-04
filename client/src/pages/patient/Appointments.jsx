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
    Stethoscope,
    Pill,
    Activity
} from 'lucide-react';

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [detailModal, setDetailModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const { success, error: showError } = useToast();
    const record = selectedAppointment?.medicalRecords?.[0];

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

    const handleViewDetails = async (apt) => {
        try {
            const res = await appointmentService.getAppointmentById(apt._id);
            if (res.success) {
                const detail = res.data?.appointment ? {
                    ...res.data.appointment,
                    patientProfile: res.data.patientProfile,
                    medications: res.data.medications,
                    healthMetrics: res.data.healthMetrics,
                    medicalRecords: res.data.medicalRecords
                } : res.data;
                setSelectedAppointment(detail || apt);
                setDetailModal(true);
            }
        } catch (error) {
            showError('Không thể tải chi tiết lịch hẹn');
        }
    };

    const handleCancelConfirm = async () => {
        if (!selectedAppointment) return;

        setCancelling(true);
        try {
            await appointmentService.cancelAppointment(selectedAppointment._id);
            success('Hủy lịch hẹn thành công');
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
                                        {apt.doctorId?.avatar ? (
                                            <img
                                                src={apt.doctorId.avatar}
                                                alt={apt.doctorId?.fullName || 'Bác sĩ'}
                                                className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-blue-200 flex-shrink-0 border-2 border-white"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
                                                {apt.doctorId?.fullName ? (
                                                    <span className="text-white text-xl font-bold">
                                                        {apt.doctorId.fullName.charAt(0).toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <Stethoscope className="w-7 h-7 text-white" />
                                                )}
                                            </div>
                                        )}

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

                                        <button
                                            onClick={() => handleViewDetails(apt)}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                            Xem chi tiết
                                        </button>
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

            {detailModal && selectedAppointment && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                    onClick={() => setDetailModal(false)}
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shrink-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold">Chi tiết lịch hẹn</h2>
                                        {(() => {
                                            const statusConfig = getStatusConfig(selectedAppointment.status);
                                            return (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20`}>
                                                    {statusConfig.icon && <statusConfig.icon className="w-3 h-3" />}
                                                    {statusConfig.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-blue-100">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(selectedAppointment.appointmentDate)}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {selectedAppointment.timeSlot}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDetailModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar grow">
                            <div className="space-y-6">
                                {/* Doctor & Clinic Info Cards */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 uppercase">Bác sĩ phụ trách</p>
                                                <p className="font-semibold text-slate-900">{selectedAppointment.doctorId?.fullName}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 pl-[52px]">{selectedAppointment.doctorId?.specialty}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 uppercase">Phòng khám</p>
                                                <p className="font-semibold text-slate-900">{selectedAppointment.clinicId?.name}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 pl-[52px] line-clamp-1">{selectedAppointment.clinicId?.address}</p>
                                    </div>
                                </div>

                                {/* Medical Info */}
                                <div className="space-y-4">
                                    {selectedAppointment.reason && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Lý do khám
                                            </h4>
                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-slate-800">
                                                {selectedAppointment.reason}
                                            </div>
                                        </div>
                                    )}

                                    {(record?.symptoms || selectedAppointment.symptoms) && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Stethoscope className="w-4 h-4" />
                                                Triệu chứng
                                            </h4>
                                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-slate-800">
                                                {record?.symptoms || selectedAppointment.symptoms}
                                            </div>
                                        </div>
                                    )}

                                    {record?.treatment && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Phương pháp điều trị
                                            </h4>
                                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-slate-800">
                                                {record.treatment}
                                            </div>
                                        </div>
                                    )}

                                    {record?.doctorNotes && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Stethoscope className="w-4 h-4" />
                                                Ghi chú bác sĩ
                                            </h4>
                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-slate-800 whitespace-pre-line">
                                                {record.doctorNotes}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Prescriptions */}
                                {(() => {
                                    const prescriptions = record?.prescriptions?.length ? record.prescriptions : (selectedAppointment.medications || []);
                                    return prescriptions.length > 0 ? (
                                        <div className="pt-4 border-t border-slate-100">
                                            <p className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Pill className="w-5 h-5 text-purple-500" />
                                                Đơn thuốc ({prescriptions.length} loại)
                                            </p>
                                            <div className="space-y-3">
                                                {prescriptions.map((med, idx) => (
                                                    <div
                                                        key={med._id || idx}
                                                        className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-purple-600 border border-purple-100">
                                                                <Pill className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-slate-900 text-lg">{med.name}</p>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {med.dosage && (
                                                                        <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-medium text-slate-600 border border-purple-100 shadow-sm">
                                                                            💊 {med.dosage}
                                                                        </span>
                                                                    )}
                                                                    {med.frequency && (
                                                                        <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-medium text-slate-600 border border-purple-100 shadow-sm">
                                                                            🔄 {med.frequency}
                                                                        </span>
                                                                    )}
                                                                    {med.duration && (
                                                                        <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-medium text-slate-600 border border-purple-100 shadow-sm">
                                                                            📅 {med.duration}
                                                                        </span>
                                                                    )}
                                                                    {!med.duration && (med.startDate || med.endDate) && (
                                                                        <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-medium text-slate-600 border border-purple-100 shadow-sm">
                                                                            📅 {med.startDate ? new Date(med.startDate).toLocaleDateString('vi-VN') : ''}{med.endDate ? ` - ${new Date(med.endDate).toLocaleDateString('vi-VN')}` : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {med.instructions && (
                                                                    <p className="text-sm text-slate-500 mt-2.5 flex items-start gap-2">
                                                                        <span className="shrink-0 mt-0.5">📝</span>
                                                                        <span className="italic">{med.instructions}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                {/* Health Metrics */}
                                {selectedAppointment.healthMetrics && Object.keys(selectedAppointment.healthMetrics).length > 0 && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-rose-500" />
                                            Chỉ số sức khỏe
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {Object.entries(selectedAppointment.healthMetrics).map(([key, metric]) => (
                                                <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center hover:bg-white hover:shadow-md transition-all">
                                                    <p className="text-xs text-slate-500 capitalize mb-1">{key.replace('_', ' ')}</p>
                                                    <p className="text-slate-900 font-bold text-lg">
                                                        {metric.value}
                                                        <span className="text-xs font-normal text-slate-400 ml-1">{metric.unit}</span>
                                                    </p>
                                                    {metric.secondaryValue && (
                                                        <p className="text-sm text-slate-600 border-t border-slate-200 mt-1 pt-1">
                                                            {metric.secondaryValue}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                            <button
                                onClick={() => setDetailModal(false)}
                                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
