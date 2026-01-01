import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  Activity,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      const res = await login(normalizedEmail, password);
      const ok = res?.success ?? res?.data?.success;

      if (!ok) {
        const msg =
          res?.error ??
          res?.data?.error ??
          res?.data?.message ??
          "Đăng nhập thất bại";
        showError(msg);
        return;
      }

      success("Chào mừng bạn quay trở lại!", "Đăng nhập thành công");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi. Vui lòng thử lại.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600" />
        <div className="absolute inset-0 bg-black/10" />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />

        {/* Floating cards */}
        <div
          className="absolute top-20 left-16 w-24 h-24 bg-white/12 rounded-3xl backdrop-blur-md animate-float"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-40 right-28 w-16 h-16 bg-white/12 rounded-2xl backdrop-blur-md animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-40 left-28 w-20 h-20 bg-white/12 rounded-full backdrop-blur-md animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 right-16 w-32 h-32 bg-white/12 rounded-3xl backdrop-blur-md animate-float"
          style={{ animationDelay: "0.5s" }}
        />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/25 flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight">Healthcare</p>
              <p className="text-white/80 text-sm">
                Booking • Records • Wellness
              </p>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-5">
            Chăm sóc sức khỏe
            <br />
            <span className="text-white/90">mọi lúc</span>,{" "}
            <span className="text-white/90">mọi nơi</span>
          </h1>

          <p className="text-lg text-white/85 mb-10 max-w-md leading-relaxed">
            Đặt lịch khám, theo dõi sức khỏe và quản lý thuốc dễ dàng với trải
            nghiệm hiện đại, nhanh chóng và an toàn.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/12 backdrop-blur-md ring-1 ring-white/20">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Theo dõi sức khỏe</p>
                <p className="text-white/75 text-sm">
                  Quản lý chỉ số hàng ngày, nhắc lịch thông minh
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/12 backdrop-blur-md ring-1 ring-white/20">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Bảo mật thông tin</p>
                <p className="text-white/75 text-sm">
                  Mã hóa dữ liệu và phân quyền truy cập rõ ràng
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 inline-flex items-center gap-2 text-white/85">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">
              Trải nghiệm “glass + gradient” hiện đại, dễ dùng
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-8 lg:p-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 bg-fuchsia-200/35 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-indigo-200 mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Healthcare Booking
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Đăng nhập để tiếp tục
            </p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Đăng nhập
            </h2>
            <p className="text-gray-500 mt-2">
              Nhập thông tin của bạn để tiếp tục
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl shadow-indigo-100/60 ring-1 ring-white/50 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    autoFocus
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm
                               focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300
                               transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white/80 border border-white/60 shadow-sm
                               focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300
                               transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
                               flex items-center justify-center text-gray-500 hover:text-indigo-600
                               hover:bg-indigo-50 transition"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl font-semibold text-white
                           bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600
                           hover:from-blue-700 hover:via-indigo-700 hover:to-fuchsia-700
                           shadow-lg shadow-indigo-200/70
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
                <div className="w-full border-t border-gray-200/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/70 text-gray-500 font-medium rounded-full">
                  Chưa có tài khoản?
                </span>
              </div>
            </div>

            {/* Register */}
            <Link
              to="/register"
              className="w-full h-12 rounded-2xl font-semibold
                         bg-white/80 hover:bg-white text-gray-800
                         ring-1 ring-gray-200/80 hover:ring-indigo-200
                         shadow-sm transition flex items-center justify-center"
            >
              Tạo tài khoản mới
            </Link>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 p-5 rounded-3xl bg-white/65 backdrop-blur-xl ring-1 ring-white/50 shadow-lg shadow-indigo-100/50">
            <p className="text-xs font-extrabold text-gray-600 text-center mb-3 uppercase tracking-wider">
              Tài khoản demo
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-100">
                <p className="font-bold text-indigo-700">Bệnh nhân</p>
                <p className="text-gray-600 mt-1">patient1@test.com</p>
              </div>

              <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 ring-1 ring-teal-100">
                <p className="font-bold text-teal-700">Bác sĩ</p>
                <p className="text-gray-600 mt-1">doctor1@test.com</p>
              </div>

              <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 ring-1 ring-purple-100">
                <p className="font-bold text-purple-700">Admin</p>
                <p className="text-gray-600 mt-1">admin1@test.com</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Mật khẩu:{" "}
              <span className="font-mono font-bold text-gray-700">
                12345678
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
