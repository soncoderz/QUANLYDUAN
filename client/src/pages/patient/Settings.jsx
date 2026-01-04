import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
    User,
    Mail,
    Phone,
    Calendar,
    Heart,
    AlertTriangle,
    Save,
    MapPin,
    Shield,
    Camera,
    Check
} from 'lucide-react';

export default function Settings() {
    const { user, profile, checkAuth } = useAuth();
    const { success, error: showError, info } = useToast();
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        allergies: '',
        emergencyContact: '',
        emergencyPhone: '',
        address: '',
        phone: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.fullName || '',
                dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
                gender: profile.gender || '',
                bloodType: profile.bloodType || '',
                allergies: profile.allergies?.join(', ') || '',
                emergencyContact: profile.emergencyContact || '',
                emergencyPhone: profile.emergencyPhone || '',
                address: profile.address || '',
                phone: user?.phone || '',
            });
        }
    }, [profile, user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await profileService.updateProfile({
                ...formData,
                allergies: formData.allergies.split(',').map((a) => a.trim()).filter(Boolean),
            });

            if (response.success) {
                success('Thông tin đã được cập nhật thành công!');
                setHasChanges(false);
                await checkAuth();
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="max-w-3xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="mb-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Cài đặt</h1>
                <p className="text-gray-500">Quản lý thông tin cá nhân và tài khoản</p>
            </div>

            {/* Profile Card */}

            <div className="bg-gradient-to-r from-blue-500 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        {profile?.avatar ? (
                            <img
                                src={profile.avatar}
                                alt="Avatar"
                                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold shadow-lg">
                                {formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="avatar-upload"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                try {
                                    const formDataUpload = new FormData();
                                    formDataUpload.append('image', file);

                                    const { default: api } = await import('../../services/api');
                                    const response = await api.post('/upload/avatar', formDataUpload, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                    });

                                    if (response.data.success) {
                                        // Update profile with new avatar
                                        const updateResponse = await profileService.updateProfile({
                                            avatar: response.data.data.url
                                        });

                                        if (updateResponse.success) {
                                            success('Đã cập nhật ảnh đại diện!');
                                            await checkAuth();
                                        }
                                    }
                                } catch (err) {
                                    console.error('Upload error:', err);
                                    showError('Không thể upload ảnh');
                                }
                            }}
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <Camera className="w-4 h-4 text-blue-600" />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{formData.fullName || 'Chưa cập nhật'}</h2>
                        <p className="text-white/80">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-white/20 text-sm font-medium">
                            <Shield className="w-3 h-3" />
                            {user?.role === 'patient' ? 'Bệnh nhân' : user?.role === 'doctor' ? 'Bác sĩ' : 'Quản trị viên'}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
                            <p className="text-sm text-gray-500">Thông tin cơ bản của bạn</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'male', label: 'Nam' },
                                        { value: 'female', label: 'Nữ' },
                                        { value: 'other', label: 'Khác' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleChange('gender', option.value)}
                                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${formData.gender === option.value
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        className="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-base bg-gray-50"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="0901234567"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="Nhập địa chỉ của bạn"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Thông tin y tế</h2>
                            <p className="text-sm text-gray-500">Thông tin quan trọng cho việc khám chữa bệnh</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nhóm máu</label>
                            <div className="flex flex-wrap gap-2">
                                {bloodTypes.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleChange('bloodType', type)}
                                        className={`w-14 h-14 rounded-xl text-sm font-bold transition-all ${formData.bloodType === type
                                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Dị ứng
                            </label>
                            <input
                                type="text"
                                value={formData.allergies}
                                onChange={(e) => handleChange('allergies', e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                placeholder="VD: Penicillin, Hải sản, Đậu phộng (phân cách bằng dấu phẩy)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Phân cách các loại dị ứng bằng dấu phẩy</p>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Liên hệ khẩn cấp</h2>
                            <p className="text-sm text-gray-500">Người liên hệ khi có trường hợp khẩn cấp</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên người liên hệ</label>
                            <input
                                type="text"
                                value={formData.emergencyContact}
                                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                value={formData.emergencyPhone}
                                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                placeholder="0901234567"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                    {hasChanges && (
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    fullName: profile?.fullName || '',
                                    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
                                    gender: profile?.gender || '',
                                    bloodType: profile?.bloodType || '',
                                    allergies: profile?.allergies?.join(', ') || '',
                                    emergencyContact: profile?.emergencyContact || '',
                                    emergencyPhone: profile?.emergencyPhone || '',
                                    address: profile?.address || '',
                                    phone: user?.phone || '',
                                });
                                setHasChanges(false);
                                info('Đã hủy các thay đổi');
                            }}
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                            Hủy thay đổi
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || !hasChanges}
                        className="flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {hasChanges ? <Save className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                {hasChanges ? 'Lưu thay đổi' : 'Đã cập nhật'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
