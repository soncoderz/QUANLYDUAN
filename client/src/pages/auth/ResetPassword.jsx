import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, Heart, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { success: showSuccess, error: showError } = useToast();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu link mới.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 8) {
            showError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                password
            });
            if (response.data.success) {
                setSuccess(true);
                showSuccess('Đặt lại mật khẩu thành công!');
            } else {
                showError(response.data.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
            showError(errorMsg);
            if (errorMsg.includes('het han') || errorMsg.includes('khong hop le')) {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="flex items-center gap-3 justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-200">
                        <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-blue-600">Healthcare Booking</p>
                        <p className="text-sm text-slate-500">Chăm sóc sức khỏe an tâm</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-7">
                    {error && !success ? (
                        <div className="space-y-4 text-center">
                            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto">
                                <KeyRound className="w-7 h-7 text-rose-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Link không hợp lệ</h2>
                                <p className="text-slate-600 mt-2">{error}</p>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-md hover:shadow-lg transition"
                            >
                                Yêu cầu link mới
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="space-y-4 text-center">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Đặt lại mật khẩu thành công!</h2>
                                <p className="text-slate-600 mt-2">
                                    Bạn đã có thể đăng nhập và tiếp tục sử dụng dịch vụ với mật khẩu mới.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-md hover:shadow-lg transition"
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h2>
                                <p className="text-slate-600">
                                    Nhập mật khẩu mới cho tài khoản của bạn.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-800">
                                        Mật khẩu mới
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock className="w-5 h-5" />
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                                            placeholder="Ít nhất 8 ký tự"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-800">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock className="w-5 h-5" />
                                        </span>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                                            placeholder="Nhập lại mật khẩu mới"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-sky-500 shadow-md hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <KeyRound className="w-5 h-5" />
                                            Đặt mật khẩu mới
                                        </>
                                    )}
                                </button>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600">
                                    <p className="font-semibold text-slate-800 mb-1">Mẹo tạo mật khẩu mạnh</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.</li>
                                        <li>Không dùng lại mật khẩu cũ hoặc thông tin dễ đoán.</li>
                                        <li>Giữ bí mật, không chia sẻ cho người khác.</li>
                                    </ul>
                                </div>
                            </form>
                        </>
                    )}

                    {!success && !error && (
                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
