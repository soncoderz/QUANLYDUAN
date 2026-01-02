import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LogIn, Mail, Lock, Eye, EyeOff, Heart, Activity, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await login(email, password);
            if (response.success) {
                success('Chào mừng bạn quay trở lại!', 'Đăng nhập thành công');
                // Redirect based on role
                const userRole = response.data?.user?.role;
                if (userRole === 'clinic_admin') {
                    navigate('/admin');
                } else if (userRole === 'doctor') {
                    navigate('/doctor');
                } else {
                    navigate('/dashboard');
                }
            } else {
                showError(response.error || 'Đăng nhập thất bại');
            }
        } catch (err) {
            showError(err.response?.data?.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />

                {/* Floating Elements */}
                <div className="absolute top-20 left-20 w-24 h-24 bg-white/10 rounded-3xl animate-float" style={{ animationDelay: '0s' }} />
                <div className="absolute top-40 right-40 w-16 h-16 bg-white/10 rounded-2xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-40 left-40 w-20 h-20 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-3xl animate-float" style={{ animationDelay: '0.5s' }} />

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Heart className="w-8 h-8" />
                        </div>
                        <span className="text-3xl font-bold">Healthcare</span>
                    </div>

                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Chăm sóc sức khỏe<br />
                        của bạn mọi lúc,<br />
                        mọi nơi
                    </h1>

                    <p className="text-xl text-white/80 mb-12 max-w-md">
                        Đặt lịch khám, theo dõi sức khỏe và quản lý thuốc một cách dễ dàng với hệ thống của chúng tôi.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold">Theo dõi sức khỏe</p>
                                <p className="text-white/70 text-sm">Quản lý chỉ số sức khỏe hàng ngày</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold">Bảo mật thông tin</p>
                                <p className="text-white/70 text-sm">Dữ liệu được mã hóa an toàn</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-16 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="w-full max-w-md animate-fadeIn">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-medical mb-4">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Healthcare Booking</h1>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Đăng nhập
                        </h2>
                        <p className="text-gray-500">
                            Nhập thông tin của bạn để tiếp tục
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="card-static p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="input-group">
                                    <Mail className="input-group-icon w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input input-icon"
                                        placeholder="your@email.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="input-group">
                                    <Lock className="input-group-icon w-5 h-5" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input input-icon pr-12"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                    style={{ color: 'var(--primary-600)' }}
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? (
                                    <div className="spinner spinner-sm border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Đăng nhập
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">Chưa có tài khoản?</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <Link
                            to="/register"
                            className="btn btn-secondary w-full"
                        >
                            Tạo tài khoản mới
                        </Link>
                    </div>

                    {/* Demo Accounts */}
                    <div className="mt-6 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100">
                        <p className="text-xs font-semibold text-gray-600 text-center mb-3 uppercase tracking-wide">
                            Tài khoản demo
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="text-center p-2 bg-blue-50 rounded-xl">
                                <p className="font-semibold text-blue-700">Bệnh nhân</p>
                                <p className="text-gray-600 mt-1">patient1@test.com</p>
                            </div>
                            <div className="text-center p-2 bg-teal-50 rounded-xl">
                                <p className="font-semibold text-teal-700">Bác sĩ</p>
                                <p className="text-gray-600 mt-1">doctor1@test.com</p>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-xl">
                                <p className="font-semibold text-purple-700">Admin</p>
                                <p className="text-gray-600 mt-1">admin1@test.com</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-3">
                            Mật khẩu: <span className="font-mono font-semibold">12345678</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
