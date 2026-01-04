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
    X,
    Plus,
    Trash2
} from 'lucide-react';

// Dropdown options for medications
const MEDICINE_OPTIONS = [
    'Paracetamol 500mg',
    'Amoxicillin 500mg',
    'Ibuprofen 400mg',
    'Omeprazole 20mg',
    'Cetirizine 10mg',
    'Metformin 500mg',
    'Vitamin C 1000mg',
    'Vitamin B Complex',
    'Aspirin 100mg',
    'Clarithromycin 250mg',
    'Azithromycin 250mg',
    'Dexamethasone 0.5mg',
    'Loratadine 10mg',
    'Ambroxol 30mg'
];

const DOSAGE_OPTIONS = [
    '1 viên/lần',
    '2 viên/lần',
    '1/2 viên/lần',
    '1 gói/lần',
    '5ml/lần',
    '10ml/lần',
    '15ml/lần',
    '1 ống/lần'
];

const FREQUENCY_OPTIONS = [
    '1 lần/ngày',
    '2 lần/ngày',
    '3 lần/ngày',
    '4 lần/ngày',
    'Sáng - Tối',
    'Sáng - Trưa - Tối',
    'Khi cần',
    'Trước khi ngủ'
];

const INSTRUCTION_OPTIONS = [
    'Uống sau ăn 30 phút',
    'Uống trước ăn 30 phút',
    'Uống với nhiều nước',
    'Uống lúc đói',
    'Ngậm dưới lưỡi',
    'Hòa tan trong nước',
    'Theo chỉ định bác sĩ',
    'Không uống chung với sữa'
];

export default function DoctorAppointments() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [pagination, setPagination] = useState({});
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [medicationsInput, setMedicationsInput] = useState([{ name: MEDICINE_OPTIONS[0], customName: '', isCustom: false, dosage: DOSAGE_OPTIONS[0], frequency: FREQUENCY_OPTIONS[0], instructions: INSTRUCTION_OPTIONS[0] }]);
    const [recordFormData, setRecordFormData] = useState({
        diagnosis: '',
        symptoms: '',
        treatment: '',
        doctorNotes: ''
    });
    const { success, error: showError } = useToast();
    const record = selectedAppointment?.medicalRecords?.[0];

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

    const handleOpenAppointment = async (apt) => {
        setSelectedAppointment(apt);
        setShowModal(true);
        try {
            const res = await api.get(`/appointments/${apt._id}`);
            if (res.data.success) {
                const data = res.data.data;
                const detail = data?.appointment ? {
                    ...data.appointment,
                    patientProfile: data.patientProfile,
                    medications: data.medications,
                    healthMetrics: data.healthMetrics,
                    medicalRecords: data.medicalRecords
                } : data;
                setSelectedAppointment(prev => ({ ...apt, ...detail }));
            }
        } catch (error) {
            showError('Không thể tải chi tiết lịch hẹn');
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        if (!appointmentId) {
            showError('Không xác định lịch hẹn');
            return;
        }
        try {
            if (newStatus === 'completed') {
                // Validate required fields for medical record
                if (!recordFormData.diagnosis.trim()) {
                    showError('Vui lòng nhập chẩn đoán bệnh');
                    return;
                }

                const meds = medicationsInput
                    .filter(m => m.name.trim())
                    .map(m => ({
                        name: m.name.trim(),
                        dosage: m.dosage,
                        frequency: m.frequency,
                        instructions: m.instructions
                    }));

                if (meds.length === 0) {
                    showError('Vui lòng thêm ít nhất một thuốc trước khi hoàn thành');
                    return;
                }

                // Create medical record with prescriptions
                const recordPayload = {
                    patientId: selectedAppointment.patientId?._id,
                    appointmentId: appointmentId,
                    diagnosis: recordFormData.diagnosis,
                    symptoms: recordFormData.symptoms,
                    treatment: recordFormData.treatment,
                    doctorNotes: recordFormData.doctorNotes,
                    prescriptions: meds
                };

                const response = await api.post('/doctors/records', recordPayload);
                if (response.data.success) {
                    success('Tạo hồ sơ bệnh án và hoàn thành lịch khám thành công');
                    fetchAppointments();
                    setShowModal(false);
                    setMedicationsInput([{ name: MEDICINE_OPTIONS[0], customName: '', isCustom: false, dosage: DOSAGE_OPTIONS[0], frequency: FREQUENCY_OPTIONS[0], instructions: INSTRUCTION_OPTIONS[0] }]);
                    setRecordFormData({ diagnosis: '', symptoms: '', treatment: '', doctorNotes: '' });
                }
            } else {
                // For other status updates (confirm, cancel)
                const payload = { status: newStatus };
                const response = await api.patch(`/doctors/appointments/${appointmentId}/status`, payload);
                if (response.data.success) {
                    success('Cập nhật trạng thái thành công');
                    fetchAppointments();
                    setShowModal(false);
                }
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể cập nhật trạng thái');
        }
    };

    const addMedication = () => {
        setMedicationsInput([...medicationsInput, { name: MEDICINE_OPTIONS[0], customName: '', isCustom: false, dosage: DOSAGE_OPTIONS[0], frequency: FREQUENCY_OPTIONS[0], instructions: INSTRUCTION_OPTIONS[0] }]);
    };

    const removeMedication = (index) => {
        setMedicationsInput(medicationsInput.filter((_, i) => i !== index));
    };

    const updateMedication = (index, field, value) => {
        const updated = [...medicationsInput];
        if (field === 'name') {
            if (value === '__custom__') {
                updated[index] = { ...updated[index], name: '', isCustom: true };
            } else {
                updated[index] = { ...updated[index], name: value, isCustom: false, customName: '' };
            }
        } else if (field === 'customName') {
            updated[index] = { ...updated[index], name: value, customName: value };
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setMedicationsInput(updated);
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
                                onClick={() => handleOpenAppointment(apt)}
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

                            {(record?.symptoms || selectedAppointment.symptoms) && (
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Triệu chứng</p>
                                    <p className="text-white">{record?.symptoms || selectedAppointment.symptoms}</p>
                                </div>
                            )}

                            {record?.treatment && (
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Phương pháp điều trị</p>
                                    <p className="text-white">{record.treatment}</p>
                                </div>
                            )}

                            {record?.doctorNotes && (
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Ghi chú bác sĩ</p>
                                    <p className="text-white whitespace-pre-line">{record.doctorNotes}</p>
                                </div>
                            )}

                            {(() => {
                                const prescriptions = record?.prescriptions?.length ? record.prescriptions : (selectedAppointment.medications || []);
                                return prescriptions.length > 0 ? (
                                    <div className="p-3 bg-slate-700/30 rounded-xl space-y-2">
                                        <p className="text-xs text-slate-400 mb-1">Đơn thuốc ({prescriptions.length} loại)</p>
                                        {prescriptions.map((med, idx) => (
                                            <div key={med._id || idx} className="p-3 rounded-xl bg-slate-700/40 border border-slate-700/70">
                                                <p className="text-white font-semibold">{med.name}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {med.dosage && (
                                                        <span className="px-2 py-1 bg-slate-800/70 rounded-lg text-[11px] text-slate-200 border border-slate-600/60">
                                                            💊 {med.dosage}
                                                        </span>
                                                    )}
                                                    {med.frequency && (
                                                        <span className="px-2 py-1 bg-slate-800/70 rounded-lg text-[11px] text-slate-200 border border-slate-600/60">
                                                            🔄 {med.frequency}
                                                        </span>
                                                    )}
                                                    {med.duration && (
                                                        <span className="px-2 py-1 bg-slate-800/70 rounded-lg text-[11px] text-slate-200 border border-slate-600/60">
                                                            📅 {med.duration}
                                                        </span>
                                                    )}
                                                    {!med.duration && (med.startDate || med.endDate) && (
                                                        <span className="px-2 py-1 bg-slate-800/70 rounded-lg text-[11px] text-slate-200 border border-slate-600/60">
                                                            📅 {med.startDate ? new Date(med.startDate).toLocaleDateString('vi-VN') : ''}{med.endDate ? ` - ${new Date(med.endDate).toLocaleDateString('vi-VN')}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                {med.instructions && (
                                                    <p className="text-xs text-slate-400 mt-2 italic">📝 {med.instructions}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : null;
                            })()}

                            {/* Medications Input - Only show when not completed */}
                            {!['completed', 'cancelled'].includes(selectedAppointment.status) && (
                                <div className="border-t border-slate-700 pt-4 space-y-4">
                                    {/* Diagnosis Section */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">
                                            Chẩn đoán bệnh <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={recordFormData.diagnosis}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, diagnosis: e.target.value })}
                                            placeholder="Nhập chẩn đoán bệnh..."
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    {/* Symptoms */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">Triệu chứng</label>
                                        <textarea
                                            value={recordFormData.symptoms}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, symptoms: e.target.value })}
                                            placeholder="Mô tả triệu chứng của bệnh nhân..."
                                            rows={2}
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    {/* Treatment */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">Phương pháp điều trị</label>
                                        <textarea
                                            value={recordFormData.treatment}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, treatment: e.target.value })}
                                            placeholder="Mô tả phương pháp điều trị..."
                                            rows={2}
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    {/* Doctor Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">Ghi chú bác sĩ</label>
                                        <textarea
                                            value={recordFormData.doctorNotes}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, doctorNotes: e.target.value })}
                                            placeholder="Ghi chú thêm..."
                                            rows={2}
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    {/* Medications Header */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-white">Đơn thuốc (bắt buộc khi hoàn thành)</p>
                                        <button
                                            type="button"
                                            onClick={addMedication}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg text-sm hover:bg-teal-500/30"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Thêm thuốc
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {medicationsInput.map((med, idx) => (
                                            <div key={idx} className="p-3 bg-slate-700/30 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-400">Thuốc {idx + 1}</span>
                                                    {medicationsInput.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMedication(idx)}
                                                            className="text-rose-400 hover:text-rose-300"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Tên thuốc *</label>
                                                    <select
                                                        value={med.isCustom ? '__custom__' : med.name}
                                                        onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                                    >
                                                        {MEDICINE_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                        <option value="__custom__">-- Khác (nhập tay) --</option>
                                                    </select>
                                                    {med.isCustom && (
                                                        <input
                                                            type="text"
                                                            placeholder="Nhập tên thuốc..."
                                                            value={med.customName}
                                                            onChange={(e) => updateMedication(idx, 'customName', e.target.value)}
                                                            className="w-full mt-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                                        />
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-slate-400 mb-1">Liều lượng</label>
                                                        <select
                                                            value={med.dosage}
                                                            onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                                        >
                                                            {DOSAGE_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-400 mb-1">Tần suất</label>
                                                        <select
                                                            value={med.frequency}
                                                            onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                                        >
                                                            {FREQUENCY_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Hướng dẫn sử dụng</label>
                                                    <select
                                                        value={med.instructions}
                                                        onChange={(e) => updateMedication(idx, 'instructions', e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                                    >
                                                        {INSTRUCTION_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
