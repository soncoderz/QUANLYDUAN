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
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-50">
            <div className="w-full max-w-md animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-medical mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Healthcare Booking</h1>
                </div>

                <div className="card-static p-6 sm:p-8">
                    {error && !success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Link không hợp lệ
                            </h2>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <Link to="/forgot-password" className="btn btn-primary">
                                Yêu cầu link mới
                            </Link>
                        </div>
                    ) : success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Đặt lại mật khẩu thành công!
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Bạn đã có thể đăng nhập với mật khẩu mới.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="btn btn-primary w-full"
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Đặt mật khẩu mới
                                </h2>
                                <p className="text-gray-500">
                                    Nhập mật khẩu mới cho tài khoản của bạn.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mật khẩu mới
                                    </label>
                                    <div className="input-group">
                                        <Lock className="input-group-icon w-5 h-5" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input input-icon pr-12"
                                            placeholder="Ít nhất 8 ký tự"
                                            required
                                            minLength={8}
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

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="input-group">
                                        <Lock className="input-group-icon w-5 h-5" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input input-icon pr-12"
                                            placeholder="Nhập lại mật khẩu"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? (
                                        <div className="spinner spinner-sm border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <KeyRound className="w-5 h-5" />
                                            Đặt mật khẩu mới
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {!success && !error && (
                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
