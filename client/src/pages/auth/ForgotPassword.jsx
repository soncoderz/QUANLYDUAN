import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Mail, ArrowLeft, Send, Heart, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { success, error: showError } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                setSent(true);
                success('Đã gửi email hướng dẫn đặt lại mật khẩu!');
            } else {
                showError(response.data.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            showError(err.response?.data?.error || 'Không thể gửi email. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="w-full max-w-md animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-medical mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Healthcare Booking</h1>
                </div>

                <div className="card-static p-6 sm:p-8">
                    {!sent ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Quên mật khẩu?
                                </h2>
                                <p className="text-gray-500">
                                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? (
                                        <div className="spinner spinner-sm border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Gửi hướng dẫn
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Kiểm tra email!
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <span className="font-semibold text-gray-700">{email}</span>. Vui lòng kiểm tra hộp thư của bạn.
                            </p>
                            <p className="text-sm text-gray-400">
                                Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                    style={{ color: 'var(--primary-600)' }}
                                >
                                    thử lại
                                </button>
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
