import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Clock,
    FileText,
    Save,
    Camera,
    Stethoscope
} from 'lucide-react';

export default function DoctorSettings() {
    const { user, checkAuth } = useAuth();
    const { success, error: showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        specialty: '',
        education: '',
        experience: 0,
        description: '',
        avatar: ''
    });

    useEffect(() => {
        fetchDoctorProfile();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const response = await api.get('/doctors/dashboard');
            if (response.data.success) {
                const doctor = response.data.data.doctor;
                setDoctorProfile(doctor);
                setFormData({
                    fullName: doctor.fullName || '',
                    specialty: doctor.specialty || '',
                    education: doctor.education || '',
                    experience: doctor.experience || 0,
                    description: doctor.description || '',
                    avatar: doctor.avatar || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.put('/doctors/profile', formData);
            if (response.data.success) {
                success('Cập nhật thông tin thành công!');
                await checkAuth();
            }
        } catch (error) {
            showError('Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const response = await api.post('/upload/avatar', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setFormData(prev => ({ ...prev, avatar: response.data.data.url }));
                success('Tải ảnh lên thành công!');
            }
        } catch (error) {
            showError('Không thể tải ảnh lên');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Cài đặt hồ sơ</h1>
                <p className="text-slate-400 mt-1">Quản lý thông tin cá nhân và chuyên môn</p>
            </div>

            {/* Profile Card */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        {formData.avatar ? (
                            <img
                                src={formData.avatar}
                                alt="Avatar"
                                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {formData.fullName?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="avatar-upload"
                            onChange={handleAvatarUpload}
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <Camera className="w-4 h-4 text-teal-600" />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{formData.fullName || 'Bác sĩ'}</h2>
                        <p className="text-white/80">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full bg-white/20 text-sm font-medium text-white">
                            <Stethoscope className="w-3 h-3" />
                            Bác sĩ
                        </span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Thông tin cá nhân</h2>
                            <p className="text-sm text-slate-400">Thông tin cơ bản của bạn</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Họ và tên</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-slate-400"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={user?.phone || ''}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600 rounded-xl text-slate-400"
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Thông tin chuyên môn</h2>
                            <p className="text-sm text-slate-400">Chuyên khoa và kinh nghiệm</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Chuyên khoa</label>
                                <input
                                    type="text"
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                    placeholder="VD: Nội khoa, Tim mạch..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Số năm kinh nghiệm</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Học vấn</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.education}
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                    placeholder="VD: Tiến sĩ Y khoa - Đại học Y Hà Nội"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Giới thiệu</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                placeholder="Giới thiệu ngắn về bản thân và chuyên môn..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-60"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Lưu thay đổi
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
