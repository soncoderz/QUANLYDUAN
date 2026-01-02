import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Stethoscope,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (formData.password !== formData.confirmPassword) {
      showError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 8) {
      showError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName,
        email,
        phone,
        password: formData.password,
      });

      const ok = res?.success ?? res?.data?.success;
      if (!ok) {
        const msg =
          res?.error ??
          res?.data?.error ??
          res?.data?.message ??
          "Đăng ký thất bại";
        showError(msg);
        return;
      }

      success("Đăng ký thành công!", "Chào mừng bạn");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Đã xảy ra lỗi";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-24 w-96 h-96 bg-fuchsia-200/35 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600 shadow-lg shadow-indigo-200 mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Tạo tài khoản
          </h1>
          <p className="text-gray-500 mt-2">
            Đăng ký để đặt lịch khám nhanh chóng
          </p>

          <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-4 h-4" />
            <span>Giao diện “glass + gradient” đồng bộ hệ thống</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl shadow-indigo-100/60 ring-1 ring-white/50 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm
                             focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm
                             focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại <span className="text-gray-400 font-medium">(tuỳ chọn)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  autoComplete="tel"
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/80 border border-white/60 shadow-sm
                             focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 transition"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 8 ký tự"
                  required
                  autoComplete="new-password"
                  className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white/80 border border-white/60 shadow-sm
                             focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
                             flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Gợi ý: dùng chữ hoa, chữ thường, số để tăng bảo mật.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                  autoComplete="new-password"
                  className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white/80 border border-white/60 shadow-sm
                             focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
                             flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl font-semibold text-white
                         bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600
                         hover:from-blue-700 hover:via-indigo-700 hover:to-fuchsia-700
                         shadow-lg shadow-indigo-200/70
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Đăng ký
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/60" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/70 text-gray-500 font-medium rounded-full">
                Đã có tài khoản?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="w-full h-12 rounded-2xl font-semibold
                       bg-white/80 hover:bg-white text-gray-800
                       ring-1 ring-gray-200/80 hover:ring-indigo-200
                       shadow-sm transition flex items-center justify-center"
          >
            Đăng nhập
          </Link>
        </div>

        {/* small footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <span className="font-semibold text-indigo-600">Điều khoản</span> và{" "}
          <span className="font-semibold text-indigo-600">Chính sách</span>.
        </p>
      </div>
    </div>
  );
}
