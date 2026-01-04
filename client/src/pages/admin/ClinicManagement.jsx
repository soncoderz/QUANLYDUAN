import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
    Search,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Building2,
    MapPin,
    Phone,
    Mail,
    Star,
    Clock,
    Users
} from 'lucide-react';

export default function ClinicManagement() {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [filters, setFilters] = useState({ search: '' });
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchClinics();
    }, [pagination.page, filters]);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            const response = await adminService.getClinics({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });
            if (response.success) {
                setClinics(response.data.clinics);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching clinics:', error);
            showError('Không thể tải danh sách phòng khám');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleToggleStatus = async (clinic) => {
        try {
            const response = await adminService.toggleClinicStatus(clinic._id, !clinic.isActive);
            if (response.success) {
                success(`Đã ${!clinic.isActive ? 'kích hoạt' : 'vô hiệu hóa'} phòng khám`);
                fetchClinics();
            }
        } catch (error) {
            showError('Không thể cập nhật trạng thái');
        }
        setActionMenuOpen(null);
    };

    const handleDelete = async (clinic) => {
        if (!confirm('Bạn có chắc muốn vô hiệu hóa phòng khám này?')) return;
        try {
            const response = await adminService.deleteClinic(clinic._id);
            if (response.success) {
                success('Đã vô hiệu hóa phòng khám');
                fetchClinics();
            }
        } catch (error) {
            showError('Không thể xóa phòng khám');
        }
        setActionMenuOpen(null);
    };

    const handleViewClinic = async (clinic) => {
        try {
            const response = await adminService.getClinicById(clinic._id);
            if (response.success) {
                setSelectedClinic(response.data);
                setModalMode('view');
                setShowModal(true);
            }
        } catch (error) {
            showError('Không thể tải thông tin phòng khám');
        }
        setActionMenuOpen(null);
    };

    const openCreateModal = () => {
        setSelectedClinic(null);
        setModalMode('create');
        setShowModal(true);
    };

    const openEditModal = (clinic) => {
        setSelectedClinic({ clinic, doctors: [] });
        setModalMode('edit');
        setShowModal(true);
        setActionMenuOpen(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Quản lý phòng khám</h1>
                    <p className="text-slate-400 mt-1">Quản lý tất cả phòng khám trong hệ thống</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm phòng khám
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                        value={filters.search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : clinics.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        Không tìm thấy phòng khám nào
                    </div>
                ) : (
                    clinics.map((clinic) => (
                        <div
                            key={clinic._id}
                            className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors"
                        >
                            {/* Image */}
                            <div className="h-40 bg-gradient-to-br from-purple-600/20 to-purple-600/20 flex items-center justify-center relative">
                                {clinic.image ? (
                                    <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-16 h-16 text-purple-400" />
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${clinic.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {clinic.isActive ? 'Hoạt động' : 'Đã đóng'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white mb-2">{clinic.name}</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{clinic.address || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Phone className="w-4 h-4 shrink-0" />
                                        <span>{clinic.phone || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Users className="w-4 h-4 shrink-0" />
                                        <span>{clinic.doctorCount || 0} bác sĩ</span>
                                    </div>
                                </div>

                                {/* Specialties */}
                                {clinic.specialty?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {clinic.specialty.slice(0, 3).map((s, i) => (
                                            <span key={i} className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-400">
                                                {s}
                                            </span>
                                        ))}
                                        {clinic.specialty.length > 3 && (
                                            <span className="px-2 py-1 rounded-lg text-xs bg-slate-600 text-slate-400">
                                                +{clinic.specialty.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Rating & Actions */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-medium">{clinic.rating?.toFixed(1) || '0.0'}</span>
                                        <span className="text-slate-500 text-sm">({clinic.totalReviews || 0})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewClinic(clinic)}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <Eye className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(clinic)}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(clinic)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && clinics.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                        Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} phòng khám
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
            )}

            {/* Modal */}
            {showModal && (
                <ClinicModal
                    mode={modalMode}
                    clinic={selectedClinic}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchClinics();
                    }}
                />
            )}
        </div>
    );
}

// Clinic Modal Component
function ClinicModal({ mode, clinic, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: clinic?.clinic?.name || '',
        address: clinic?.clinic?.address || '',
        phone: clinic?.clinic?.phone || '',
        email: clinic?.clinic?.email || '',
        specialty: clinic?.clinic?.specialty?.join(', ') || '',
        description: clinic?.clinic?.description || '',
        image: clinic?.clinic?.image || ''
    });
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                ...formData,
                specialty: formData.specialty.split(',').map(s => s.trim()).filter(Boolean)
            };

            if (data.specialty.length === 0) {
                showError('Vui lòng nhập ít nhất một chuyên khoa');
                setLoading(false);
                return;
            }

            if (mode === 'create') {
                const response = await adminService.createClinic(data);
                if (response.success) {
                    success('Tạo phòng khám thành công');
                    onSuccess();
                }
            } else if (mode === 'edit') {
                const response = await adminService.updateClinic(clinic.clinic._id, data);
                if (response.success) {
                    success('Cập nhật phòng khám thành công');
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
    const title = mode === 'create' ? 'Thêm phòng khám mới' : mode === 'edit' ? 'Chỉnh sửa phòng khám' : 'Chi tiết phòng khám';

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
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">Ảnh phòng khám</label>
                        {!isViewMode ? (
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="clinic-image-upload"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        const reader = new FileReader();
                                        reader.onload = (ev) => {
                                            setFormData(prev => ({ ...prev, image: ev.target.result }));
                                        };
                                        reader.readAsDataURL(file);

                                        try {
                                            const formDataUpload = new FormData();
                                            formDataUpload.append('image', file);
                                            const { default: api } = await import('../../services/api');
                                            const response = await api.post('/upload/image?folder=healthcare/clinics', formDataUpload, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            if (response.data.success) {
                                                setFormData(prev => ({ ...prev, image: response.data.data.url }));
                                            }
                                        } catch (err) {
                                            console.error('Upload error:', err);
                                        }
                                    }}
                                />
                                <label htmlFor="clinic-image-upload" className="cursor-pointer block">
                                    {formData.image ? (
                                        <div className="relative group">
                                            <img
                                                src={formData.image}
                                                alt="Clinic"
                                                className="w-full h-40 rounded-xl object-cover border-2 border-slate-600"
                                            />
                                            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-sm">Click để đổi ảnh</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 rounded-xl bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center hover:border-purple-500 transition-colors">
                                            <div className="text-center">
                                                <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <span className="text-slate-400 text-sm">Click để upload ảnh</span>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            </div>
                        ) : (
                            formData.image ? (
                                <img
                                    src={formData.image}
                                    alt="Clinic"
                                    className="w-full h-40 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="w-full h-40 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-600/20 flex items-center justify-center">
                                    <Building2 className="w-12 h-12 text-purple-400" />
                                </div>
                            )
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Tên phòng khám</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                disabled={isViewMode}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                placeholder="Phòng khám ABC"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Địa chỉ</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                disabled={isViewMode}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    disabled={isViewMode}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                    placeholder="0901234567"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    disabled={isViewMode}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                    placeholder="clinic@email.com"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Chuyên khoa (phân cách bằng dấu phẩy)</label>
                        <input
                            type="text"
                            value={formData.specialty}
                            onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                            disabled={isViewMode}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                            required
                            placeholder="Tim mạch, Nội khoa, Nhi khoa"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            disabled={isViewMode}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 resize-none"
                            placeholder="Mô tả về phòng khám..."
                        />
                    </div>

                    {/* View mode - show doctors */}
                    {isViewMode && clinic?.doctors?.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Danh sách bác sĩ</label>
                            <div className="space-y-2">
                                {clinic.doctors.map(doctor => (
                                    <div key={doctor._id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
                                            {doctor.fullName?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{doctor.fullName}</p>
                                            <p className="text-slate-400 text-sm">{doctor.specialty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
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
