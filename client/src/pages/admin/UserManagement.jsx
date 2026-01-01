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
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Phone,
    Shield
} from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [filters, setFilters] = useState({ search: '', role: '', status: '' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('view'); // view, edit, create
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getUsers({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });
            if (response.success) {
                setUsers(response.data.users);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            showError('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleToggleStatus = async (user) => {
        try {
            const response = await adminService.toggleUserStatus(user._id, !user.isActive);
            if (response.success) {
                success(`Đã ${!user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`);
                fetchUsers();
            }
        } catch (error) {
            showError('Không thể cập nhật trạng thái');
        }
        setActionMenuOpen(null);
    };

    const handleDelete = async (user) => {
        if (!confirm('Bạn có chắc muốn vô hiệu hóa người dùng này?')) return;
        try {
            const response = await adminService.deleteUser(user._id);
            if (response.success) {
                success('Đã vô hiệu hóa người dùng');
                fetchUsers();
            }
        } catch (error) {
            showError('Không thể xóa người dùng');
        }
        setActionMenuOpen(null);
    };

    const handleViewUser = async (user) => {
        try {
            const response = await adminService.getUserById(user._id);
            if (response.success) {
                setSelectedUser(response.data);
                setModalMode('view');
                setShowModal(true);
            }
        } catch (error) {
            showError('Không thể tải thông tin người dùng');
        }
        setActionMenuOpen(null);
    };

    const openCreateModal = () => {
        setSelectedUser(null);
        setModalMode('create');
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setSelectedUser({ user, profile: user.profile });
        setModalMode('edit');
        setShowModal(true);
        setActionMenuOpen(null);
    };

    const getRoleBadge = (role) => {
        const roles = {
            patient: { label: 'Bệnh nhân', color: 'bg-blue-500/20 text-blue-400' },
            doctor: { label: 'Bác sĩ', color: 'bg-teal-500/20 text-teal-400' },
            clinic_admin: { label: 'Quản trị', color: 'bg-purple-500/20 text-purple-400' }
        };
        const r = roles[role] || { label: role, color: 'bg-slate-500/20 text-slate-400' };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${r.color}`}>
                {r.label}
            </span>
        );
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="flex items-center gap-1 text-emerald-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Active
            </span>
        ) : (
            <span className="flex items-center gap-1 text-red-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Inactive
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Quản lý người dùng</h1>
                    <p className="text-slate-400 mt-1">Quản lý tất cả người dùng trong hệ thống</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm người dùng
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo email hoặc số điện thoại..."
                        value={filters.search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="patient">Bệnh nhân</option>
                    <option value="doctor">Bác sĩ</option>
                    <option value="clinic_admin">Quản trị</option>
                </select>
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Đã vô hiệu</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Người dùng</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Số điện thoại</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Vai trò</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Trạng thái</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Ngày tạo</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-300"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.profile?.fullName || user.email.split('@')[0]}</p>
                                                    <p className="text-slate-400 text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-300">{user.phone || '-'}</td>
                                        <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                                        <td className="py-4 px-6">{getStatusBadge(user.isActive)}</td>
                                        <td className="py-4 px-6 text-slate-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-4 px-6 text-right relative">
                                            <button
                                                onClick={() => setActionMenuOpen(actionMenuOpen === user._id ? null : user._id)}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-slate-400" />
                                            </button>
                                            {actionMenuOpen === user._id && (
                                                <div className="absolute right-6 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 py-2">
                                                    <button
                                                        onClick={() => handleViewUser(user)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 text-left"
                                                    >
                                                        <Eye className="w-4 h-4" /> Xem chi tiết
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 text-left"
                                                    >
                                                        <Edit className="w-4 h-4" /> Chỉnh sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 text-left"
                                                    >
                                                        {user.isActive ? (
                                                            <><UserX className="w-4 h-4" /> Vô hiệu hóa</>
                                                        ) : (
                                                            <><UserCheck className="w-4 h-4" /> Kích hoạt</>
                                                        )}
                                                    </button>
                                                    <hr className="my-2 border-slate-700" />
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 text-left"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
                    <p className="text-sm text-slate-400">
                        Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} người dùng
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
                            {pagination.page} / {pagination.totalPages}
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
                <UserModal
                    mode={modalMode}
                    user={selectedUser}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}

// User Modal Component
function UserModal({ mode, user, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        email: user?.user?.email || '',
        phone: user?.user?.phone || '',
        role: user?.user?.role || 'patient',
        fullName: user?.profile?.fullName || '',
        avatar: user?.profile?.avatar || '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { success, error: showError } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'create') {
                const response = await adminService.createUser(formData);
                if (response.success) {
                    success('Tạo người dùng thành công');
                    onSuccess();
                }
            } else if (mode === 'edit') {
                const response = await adminService.updateUser(user.user._id, formData);
                if (response.success) {
                    success('Cập nhật người dùng thành công');
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
    const title = mode === 'create' ? 'Thêm người dùng mới' : mode === 'edit' ? 'Chỉnh sửa người dùng' : 'Chi tiết người dùng';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex justify-center">
                        <div className="text-center">
                            <label className="block text-sm font-medium text-slate-300 mb-3">Ảnh đại diện</label>
                            {!isViewMode ? (
                                <div className="relative inline-block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="avatar-upload"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            // Create preview
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                setFormData(prev => ({ ...prev, avatar: ev.target.result }));
                                            };
                                            reader.readAsDataURL(file);

                                            // Upload to Cloudinary
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
                                    <label
                                        htmlFor="avatar-upload"
                                        className="cursor-pointer block"
                                    >
                                        {formData.avatar ? (
                                            <div className="relative group">
                                                <img
                                                    src={formData.avatar}
                                                    alt="Avatar"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-600"
                                                />
                                                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs">Đổi ảnh</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-slate-700 border-2 border-dashed border-slate-500 flex items-center justify-center hover:border-violet-500 transition-colors">
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
                                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-600 mx-auto"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                                        {formData.fullName?.charAt(0) || formData.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )
                            )}
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
                                disabled={isViewMode || mode === 'edit'}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                    </div>
                    {mode === 'create' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                placeholder="Nhập mật khẩu"
                                required
                                minLength={8}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Họ tên</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            disabled={isViewMode}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                disabled={isViewMode}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                                placeholder="0901234567"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Vai trò</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                disabled={isViewMode}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                            >
                                <option value="patient">Bệnh nhân</option>
                                <option value="doctor">Bác sĩ</option>
                                <option value="clinic_admin">Quản trị viên</option>
                            </select>
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
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
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

