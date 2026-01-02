import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { clinicService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Building2,
    Stethoscope,
    GraduationCap,
    DollarSign
} from 'lucide-react';

export default function DoctorManagement() {
    const [doctors, setDoctors] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [filters, setFilters] = useState({ search: '', clinicId: '', specialty: '' });
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchDoctors();
        fetchClinics();
    }, [pagination.page, filters]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDoctors({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });
            if (response.success) {
                setDoctors(response.data.doctors);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            showError('Không thể tải danh sách bác sĩ');
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

    const handleSearch = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleToggleAvailability = async (doctor) => {
        try {
            const response = await adminService.toggleDoctorAvailability(doctor._id, !doctor.isAvailable);
            if (response.success) {
                success(`Đã ${!doctor.isAvailable ? 'bật' : 'tắt'} trạng thái bác sĩ`);
                fetchDoctors();
            }
        } catch (error) {
            showError('Không thể cập nhật trạng thái');
        }
        setActionMenuOpen(null);
    };

    const handleDelete = async (doctor) => {
        if (!confirm('Bạn có chắc muốn vô hiệu hóa bác sĩ này?')) return;
        try {
            const response = await adminService.deleteDoctor(doctor._id);
            if (response.success) {
                success('Đã vô hiệu hóa bác sĩ');
                fetchDoctors();
            }
        } catch (error) {
            showError('Không thể xóa bác sĩ');
        }
        setActionMenuOpen(null);
    };

    const handleViewDoctor = async (doctor) => {
        try {
            const response = await adminService.getDoctorById(doctor._id);
            if (response.success) {
                setSelectedDoctor(response.data.doctor);
                setModalMode('view');
                setShowModal(true);
            }
        } catch (error) {
            showError('Không thể tải thông tin bác sĩ');
        }
        setActionMenuOpen(null);
    };

    const openCreateModal = () => {
        setSelectedDoctor(null);
        setModalMode('create');
        setShowModal(true);
    };

    const openEditModal = (doctor) => {
        setSelectedDoctor(doctor);
        setModalMode('edit');
        setShowModal(true);
        setActionMenuOpen(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Quản lý bác sĩ</h1>
                    <p className="text-slate-400 mt-1">Quản lý tất cả bác sĩ trong hệ thống</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm bác sĩ
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên bác sĩ..."
                        value={filters.search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filters.clinicId}
                    onChange={(e) => setFilters(prev => ({ ...prev, clinicId: e.target.value }))}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    <option value="">Tất cả phòng khám</option>
                    {clinics.map(clinic => (
                        <option key={clinic._id} value={clinic._id}>{clinic.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Bác sĩ</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Chuyên khoa</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Phòng khám</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Kinh nghiệm</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Trạng thái</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-300"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : doctors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        Không tìm thấy bác sĩ nào
                                    </td>
                                </tr>
                            ) : (
                                doctors.map((doctor) => {
                                    const displayName = doctor.fullName;
                                    const avatar = doctor.avatar;
                                    const initial = displayName?.charAt(0) || 'D';

                                    return (
                                        <tr key={doctor._id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {avatar ? (
                                                        <img
                                                            src={avatar}
                                                            alt={displayName}
                                                            className="w-10 h-10 rounded-xl object-cover border border-slate-700/70"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                                                            {initial}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium">{displayName}</p>
                                                        <p className="text-slate-400 text-sm">{doctor.userId?.email || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-400">
                                                {doctor.specialty || '-'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-300">{doctor.clinicId?.name || '-'}</td>
                                        <td className="py-4 px-6 text-slate-300">{doctor.experience} năm</td>
                                        <td className="py-4 px-6">
                                            {doctor.isAvailable ? (
                                                <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                    Đang làm việc
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-400 text-sm">
                                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                    Nghỉ ngơi
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right relative">
                                            <button
                                                onClick={() => setActionMenuOpen(actionMenuOpen === doctor._id ? null : doctor._id)}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-slate-400" />
                                            </button>
                                            {actionMenuOpen === doctor._id && (
                                                <div className="absolute right-6 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 py-2">
                                                    <button
                                                        onClick={() => handleViewDoctor(doctor)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 text-left"
                                                    >
                                                        <Eye className="w-4 h-4" /> Xem chi tiết
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(doctor)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 text-left"
                                                    >
                                                        <Edit className="w-4 h-4" /> Chỉnh sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleAvailability(doctor)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 text-left"
                                                    >
                                                        {doctor.isAvailable ? (
                                                            <><UserX className="w-4 h-4" /> Tạm nghỉ</>
                                                        ) : (
                                                            <><UserCheck className="w-4 h-4" /> Hoạt động</>
                                                        )}
                                                    </button>
                                                    <hr className="my-2 border-slate-700" />
                                                    <button
                                                        onClick={() => handleDelete(doctor)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 text-left"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Xóa
                                                    </button>
                                                </div>
                                            )}
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
                        Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} bác sĩ
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

            {/* Modal */}
            {showModal && (
                <DoctorModal
                    mode={modalMode}
                    doctor={selectedDoctor}
                    clinics={clinics}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchDoctors();
                    }}
                />
            )}
        </div>
    );
}

// Doctor Modal Component
function DoctorModal({ mode, doctor, clinics, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        phone: '',
        fullName: doctor?.fullName || '',
        specialty: doctor?.specialty || '',
        clinicId: doctor?.clinicId?._id || doctor?.clinicId || '',
        licenseNumber: doctor?.licenseNumber || '',
        experience: doctor?.experience || 0,
        education: doctor?.education || '',
        consultationFee: doctor?.consultationFee || 0,
        description: doctor?.description || '',
        avatar: doctor?.avatar || '',
        workingDays: doctor?.workingDays || [1, 2, 3, 4, 5],
        startTime: doctor?.startTime || '08:00',
        endTime: doctor?.endTime || '17:00',
        slotDuration: doctor?.slotDuration || 30
    });
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useToast();
    const daysOfWeek = [
        { value: 1, label: 'T2' },
        { value: 2, label: 'T3' },
        { value: 3, label: 'T4' },
        { value: 4, label: 'T5' },
        { value: 5, label: 'T6' },
        { value: 6, label: 'T7' },
        { value: 0, label: 'CN' },
    ];

    const toggleWorkingDay = (day) => {
        setFormData(prev => {
            const exists = prev.workingDays.includes(day);
            return {
                ...prev,
                workingDays: exists ? prev.workingDays.filter(d => d !== day) : [...prev.workingDays, day]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            ...formData,
            specialty: formData.specialty?.trim() || '',
            workingDays: (formData.workingDays || []).map(Number),
            slotDuration: Number(formData.slotDuration) || 30
        };
        try {
            if (mode === 'create') {
                const response = await adminService.createDoctor(payload);
                if (response.success) {
                    success('Tạo bác sĩ thành công');
                    onSuccess();
                }
            } else if (mode === 'edit') {
                const response = await adminService.updateDoctor(doctor._id, payload);
                if (response.success) {
                    success('Cập nhật bác sĩ thành công');
                    onSuccess();
                }
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const isViewMode = mode === 'view';
    const title = mode === 'create' ? 'Thêm bác sĩ mới' : mode === 'edit' ? 'Chỉnh sửa bác sĩ' : 'Chi tiết bác sĩ';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {mode === 'create' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Avatar Upload */}
                    <div className="flex justify-center pb-4">
                        <div className="text-center">
                            <label className="block text-sm font-medium text-slate-300 mb-3">Ảnh đại diện</label>
                            {!isViewMode ? (
                                <div className="relative inline-block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="doctor-avatar-upload"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                setFormData(prev => ({ ...prev, avatar: ev.target.result }));
                                            };
                                            reader.readAsDataURL(file);

                                            try {
                                                const formDataUpload = new FormData();
                                                formDataUpload.append('image', file);
                                                const { default: api } = await import('../../services/api');
                                                const response = await api.post('/upload/avatar', formDataUpload, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                if (response.data.success) {
                                                    setFormData(prev => ({ ...prev, avatar: response.data.data.url }));
                                                }
                                            } catch (err) {
                                                console.error('Upload error:', err);
                                            }
                                        }}
                                    />
                                    <label htmlFor="doctor-avatar-upload" className="cursor-pointer block">
                                        {formData.avatar ? (
                                            <div className="relative group">
                                                <img
                                                    src={formData.avatar}
                                                    alt="Avatar"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-teal-500/30"
                                                />
                                                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs">Đổi ảnh</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center hover:border-teal-500 transition-colors">
                                                <span className="text-slate-400 text-xs text-center px-2">Click để<br />upload</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            ) : (
                                formData.avatar ? (
                                    <img
                                        src={formData.avatar}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-teal-500/30 mx-auto"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                                        {formData.fullName?.charAt(0) || 'D'}
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Họ tên</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                    disabled={isViewMode}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Chuyên khoa</label>
                            <div className="relative">
                                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.specialty}
                                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                                    disabled={isViewMode}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Phòng khám</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={formData.clinicId}
                                onChange={(e) => setFormData(prev => ({ ...prev, clinicId: e.target.value }))}
                                disabled={isViewMode}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                            >
                                <option value="">Chọn phòng khám</option>
                                {clinics.map(clinic => (
                                    <option key={clinic._id} value={clinic._id}>{clinic.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Kinh nghiệm (năm)</label>
                            <input
                                type="number"
                                value={formData.experience}
                                onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                                disabled={isViewMode}
                                min="0"
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Phí khám (VNĐ)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="number"
                                    value={formData.consultationFee}
                                    onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                                    disabled={isViewMode}
                                    min="0"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Ngày làm việc</label>
                            <div className="flex flex-wrap gap-2">
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleWorkingDay(day.value)}
                                        disabled={isViewMode}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                                            formData.workingDays.includes(day.value)
                                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                                                : 'bg-slate-700/50 text-slate-300 border-slate-600'
                                        } ${isViewMode ? 'opacity-60 cursor-not-allowed' : 'hover:border-teal-500/60'}`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Bắt đầu</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                    disabled={isViewMode}
                                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Kết thúc</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                    disabled={isViewMode}
                                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Thời lượng mỗi slot (phút)</label>
                            <select
                                value={formData.slotDuration}
                                onChange={(e) => setFormData(prev => ({ ...prev, slotDuration: parseInt(e.target.value) || 30 }))}
                                disabled={isViewMode}
                                className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                            >
                                {[15, 20, 30, 45, 60].map(opt => (
                                    <option key={opt} value={opt}>{opt} phút</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Học vấn</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <textarea
                                value={formData.education}
                                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                                disabled={isViewMode}
                                rows={2}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 resize-none"
                            />
                        </div>
                    </div>
                    {!isViewMode && (
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
