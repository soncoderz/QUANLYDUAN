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
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
            {/* Background (trắng-xanh) */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-blue-50" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-200/35 rounded-full blur-3xl" />
            <div className="absolute -bottom-28 -left-28 w-[28rem] h-[28rem] bg-blue-200/30 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md animate-fadeIn">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-blue-600 shadow-lg shadow-sky-200 mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Healthcare Booking</h1>
                    <p className="text-gray-500 mt-1 text-sm">Hỗ trợ đặt lại mật khẩu nhanh chóng</p>
                </div>

                {/* Glass Card */}
                <div className="rounded-3xl bg-white/75 backdrop-blur-xl shadow-xl shadow-sky-100/70 ring-1 ring-white/60 p-6 sm:p-8">
                    {!sent ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
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
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            autoComplete="email"
                                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/90 border border-sky-100 shadow-sm
                                                       focus:outline-none focus:ring-4 focus:ring-sky-200/70 focus:border-sky-300 transition"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-2xl font-semibold text-white
                                               bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600
                                               hover:from-blue-700 hover:via-sky-700 hover:to-blue-700
                                               shadow-lg shadow-sky-200/70 disabled:opacity-60 disabled:cursor-not-allowed
                                               transition flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-sky-200">
                                <CheckCircle className="w-8 h-8 text-sky-700" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                Kiểm tra email!
                            </h2>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{" "}
                                <span className="font-semibold text-gray-700">{email}</span>.
                                <br />
                                Vui lòng kiểm tra hộp thư của bạn.
                            </p>

                            <div className="text-sm text-gray-500">
                                Không nhận được email? Kiểm tra spam hoặc{" "}
                                <button
                                    onClick={() => setSent(false)}
                                    className="font-semibold text-sky-600 hover:text-sky-700 transition"
                                >
                                    thử lại
                                </button>
                                .
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
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
