import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Stethoscope } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 8) {
            showError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            if (response.success) {
                success('Đăng ký thành công!');
                navigate('/dashboard');
            } else {
                showError(response.error || 'Đăng ký thất bại');
            }
        } catch (err) {
            showError(err.response?.data?.error || 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Background (trắng-xanh) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-blue-50" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl" />
            <div className="absolute -bottom-28 -left-28 w-[28rem] h-[28rem] bg-blue-200/30 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 shadow-lg shadow-sky-200 mb-4">
                        <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Tạo tài khoản</h1>
                    <p className="text-gray-500 mt-2">Đăng ký để đặt lịch khám</p>
                </div>

                {/* Register Form (glass) */}
                <div className="rounded-3xl bg-white/75 backdrop-blur-xl shadow-xl shadow-sky-100/70 ring-1 ring-white/60 p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Họ và tên
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    required
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/90 border border-sky-100 shadow-sm
                                               focus:outline-none focus:ring-4 focus:ring-sky-200/70 focus:border-sky-300 transition"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/90 border border-sky-100 shadow-sm
                                               focus:outline-none focus:ring-4 focus:ring-sky-200/70 focus:border-sky-300 transition"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Số điện thoại <span className="text-gray-400 font-medium">(tuỳ chọn)</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0901234567"
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/90 border border-sky-100 shadow-sm
                                               focus:outline-none focus:ring-4 focus:ring-sky-200/70 focus:border-sky-300 transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Ít nhất 8 ký tự"
                                    required
                                    className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white/90 border border-sky-100 shadow-sm
                                               focus:outline-none focus:ring-4 focus:ring-sky-200/70 focus:border-sky-300 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
                                               flex items-center justify-center text-gray-500 hover:text-sky-700 hover:bg-sky-50 transition"
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/90 border border-sky-100 shadow-sm
                                               focus:outline-none focus:ring-4 focus:ring-sky-200/70 focus:border-sky-300 transition"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-2xl font-semibold text-white
                                       bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500
                                       hover:from-blue-700 hover:via-sky-700 hover:to-cyan-600
                                       shadow-lg shadow-sky-200/70 disabled:opacity-60 disabled:cursor-not-allowed
                                       transition flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Đăng ký
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-sky-100" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white/80 text-gray-500 font-medium rounded-full">
                                Đã có tài khoản?
                            </span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link
                        to="/login"
                        className="w-full h-12 rounded-2xl font-semibold
                                   bg-white hover:bg-white text-gray-800
                                   ring-1 ring-sky-100 hover:ring-sky-200
                                   shadow-sm transition flex items-center justify-center"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}
