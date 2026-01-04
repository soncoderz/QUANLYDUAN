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
    '1 vien/lan',
    '2 vien/lan',
    '1/2 vien/lan',
    '1 goi/lan',
    '5ml/lan',
    '10ml/lan',
    '15ml/lan',
    '1 ong/lan'
];

const FREQUENCY_OPTIONS = [
    '1 lan/ngay',
    '2 lan/ngay',
    '3 lan/ngay',
    '4 lan/ngay',
    'Sang - Toi',
    'Sang - Trua - Toi',
    'Khi can',
    'Truoc khi ngu'
];

const INSTRUCTION_OPTIONS = [
    'Uong sau an 30 phut',
    'Uong truoc an 30 phut',
    'Uong voi nhieu nuoc',
    'Uong luc doi',
    'Ngam duoi luoi',
    'Hoa tan trong nuoc',
    'Theo chi dinh bac si',
    'Khong uong chung voi sua'
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
            showError('Khong the tai danh sach lich hen');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        if (!appointmentId) {
            showError('Khong xac dinh lich hen');
            return;
        }
        try {
            if (newStatus === 'completed') {
                // Validate required fields for medical record
                if (!recordFormData.diagnosis.trim()) {
                    showError('Vui long nhap chan doan benh');
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
                    showError('Vui long them it nhat mot thuoc truoc khi hoan thanh');
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
                    success('Tao ho so benh an va hoan thanh lich kham thanh cong');
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
                    success('Cap nhat trang thai thanh cong');
                    fetchAppointments();
                    setShowModal(false);
                }
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Khong the cap nhat trang thai');
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
            scheduled: 'Da len lich',
            confirmed: 'Da xac nhan',
            pending: 'Cho xu ly',
            completed: 'Hoan thanh',
            cancelled: 'Da huy',
            no_show: 'Khong den'
        };
        return labels[status] || status;
    };

    const statusOptions = [
        { value: '', label: 'Tat ca' },
        { value: 'scheduled', label: 'Da len lich' },
        { value: 'confirmed', label: 'Da xac nhan' },
        { value: 'pending', label: 'Cho xu ly' },
        { value: 'completed', label: 'Hoan thanh' },
        { value: 'cancelled', label: 'Da huy' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">Quan ly lich hen</h1>
                    <p className="text-slate-400 mt-1">Xem va quan ly cac cuoc hen cua ban</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Trang thai</label>
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
                        <label className="block text-sm text-slate-400 mb-2">Tu ngay</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Den ngay</label>
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
                            Xoa bo loc
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
                        <p className="text-slate-400 text-lg">Khong co lich hen nao</p>
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
                                            alt={apt.patientProfile.fullName || 'Benh nhan'}
                                            className="w-14 h-14 rounded-xl object-cover border border-teal-500/30"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                            <User className="w-6 h-6 text-teal-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white">
                                            {apt.patientProfile?.fullName || apt.patientId?.email || 'Benh nhan'}
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
                                Truoc
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
                            <h3 className="text-lg font-semibold text-white">Chi tiet lich hen</h3>
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
                                        alt={selectedAppointment.patientProfile.fullName || 'Benh nhan'}
                                        className="w-14 h-14 rounded-xl object-cover border border-teal-500/30"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                        <User className="w-6 h-6 text-teal-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-white">
                                        {selectedAppointment.patientProfile?.fullName || 'Benh nhan'}
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
                                    <p className="text-xs text-slate-400 mb-1">Ngay hen</p>
                                    <p className="text-white font-medium">{formatDate(selectedAppointment.appointmentDate)}</p>
                                </div>
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Gio hen</p>
                                    <p className="text-white font-medium">{formatTime(selectedAppointment.timeSlot)}</p>
                                </div>
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Phong kham</p>
                                    <p className="text-white font-medium">{selectedAppointment.clinicId?.name || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Trang thai</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedAppointment.status)}`}>
                                        {getStatusLabel(selectedAppointment.status)}
                                    </span>
                                </div>
                            </div>

                            {selectedAppointment.reason && (
                                <div className="p-3 bg-slate-700/30 rounded-xl">
                                    <p className="text-xs text-slate-400 mb-1">Ly do kham</p>
                                    <p className="text-white">{selectedAppointment.reason}</p>
                                </div>
                            )}

                            {/* Medications Input - Only show when not completed */}
                            {!['completed', 'cancelled'].includes(selectedAppointment.status) && (
                                <div className="border-t border-slate-700 pt-4 space-y-4">
                                    {/* Diagnosis Section */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">
                                            Chan doan benh <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={recordFormData.diagnosis}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, diagnosis: e.target.value })}
                                            placeholder="Nhap chan doan benh..."
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    {/* Symptoms */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">Trieu chung</label>
                                        <textarea
                                            value={recordFormData.symptoms}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, symptoms: e.target.value })}
                                            placeholder="Mo ta trieu chung cua benh nhan..."
                                            rows={2}
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    {/* Treatment */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">Phuong phap dieu tri</label>
                                        <textarea
                                            value={recordFormData.treatment}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, treatment: e.target.value })}
                                            placeholder="Mo ta phuong phap dieu tri..."
                                            rows={2}
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    {/* Doctor Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">Ghi chu bac si</label>
                                        <textarea
                                            value={recordFormData.doctorNotes}
                                            onChange={(e) => setRecordFormData({ ...recordFormData, doctorNotes: e.target.value })}
                                            placeholder="Ghi chu them..."
                                            rows={2}
                                            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    {/* Medications Header */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-white">Don thuoc (bat buoc khi hoan thanh)</p>
                                        <button
                                            type="button"
                                            onClick={addMedication}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg text-sm hover:bg-teal-500/30"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Them thuoc
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {medicationsInput.map((med, idx) => (
                                            <div key={idx} className="p-3 bg-slate-700/30 rounded-xl space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-400">Thuoc {idx + 1}</span>
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
                                                    <label className="block text-xs text-slate-400 mb-1">Ten thuoc *</label>
                                                    <select
                                                        value={med.isCustom ? '__custom__' : med.name}
                                                        onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                                    >
                                                        {MEDICINE_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                        <option value="__custom__">-- Khac (nhap tay) --</option>
                                                    </select>
                                                    {med.isCustom && (
                                                        <input
                                                            type="text"
                                                            placeholder="Nhap ten thuoc..."
                                                            value={med.customName}
                                                            onChange={(e) => updateMedication(idx, 'customName', e.target.value)}
                                                            className="w-full mt-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                                        />
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-slate-400 mb-1">Lieu luong</label>
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
                                                        <label className="block text-xs text-slate-400 mb-1">Tan suat</label>
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
                                                    <label className="block text-xs text-slate-400 mb-1">Huong dan su dung</label>
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
                                            Xac nhan
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStatusUpdate(selectedAppointment._id, 'completed')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl hover:bg-teal-500/30 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Hoan thanh
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedAppointment._id, 'cancelled')}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-500/30 transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Huy
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
