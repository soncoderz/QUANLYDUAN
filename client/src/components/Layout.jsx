import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Home,
    Calendar,
    Building2,
    FileText,
    Pill,
    Activity,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Heart,
    Bell,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }) {
    const { user, profile, logout } = useAuth();
    const { success } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            success('Hẹn gặp lại bạn!', 'Đăng xuất thành công');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            navigate('/login');
        }
    };

    const navigation = [
        { name: 'Tổng quan', href: '/dashboard', icon: Home, color: 'text-blue-600 bg-blue-100' },
        { name: 'Đặt lịch khám', href: '/booking', icon: Calendar, color: 'text-teal-600 bg-teal-100' },
        { name: 'Phòng khám', href: '/clinics', icon: Building2, color: 'text-indigo-600 bg-indigo-100' },
        { name: 'Lịch khám của tôi', href: '/appointments', icon: Calendar, color: 'text-orange-600 bg-orange-100' },
        { name: 'Hồ sơ bệnh án', href: '/records', icon: FileText, color: 'text-purple-600 bg-purple-100' },
        { name: 'Tủ thuốc', href: '/medications', icon: Pill, color: 'text-pink-600 bg-pink-100' },
        { name: 'Chỉ số sức khỏe', href: '/health', icon: Activity, color: 'text-green-600 bg-green-100' },
        { name: 'Báo cáo', href: '/reports', icon: BarChart3, color: 'text-amber-600 bg-amber-100' },
    ];

    const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

    const userName = profile?.fullName || user?.email?.split('@')[0] || 'User';
    const userInitial = userName.charAt(0).toUpperCase();
    const avatarUrl = profile?.avatar;

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-gray-100 shadow-lg shadow-gray-100/50">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-200">
                        <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-xl text-gray-900">Healthcare</span>
                        <p className="text-xs text-gray-500">Booking System</p>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={userName}
                                className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-md border border-white/40"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center font-semibold text-lg text-white shrink-0 shadow-md">
                                {userInitial}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {userName}
                            </p>
                            <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                {user?.role === 'patient' ? 'Bệnh nhân' : user?.role === 'doctor' ? 'Bác sĩ' : 'Quản trị'}
                            </p>
                        </div>
                        <button className="p-2 rounded-xl hover:bg-white/80 transition-colors relative">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Menu chính
                    </p>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.href)
                                ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-200'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isActive(item.href)
                                ? 'bg-white/20'
                                : item.color
                                }`}>
                                <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : ''}`} />
                            </div>
                            <span className="flex-1">{item.name}</span>
                            {isActive(item.href) && (
                                <ChevronRight className="w-4 h-4 opacity-70" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-gray-100 space-y-2">
                    <Link
                        to="/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive('/settings')
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-gray-600" />
                        </div>
                        <span>Cài đặt</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                    >
                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-red-600" />
                        </div>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-700" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-900">Healthcare</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors relative">
                            <Bell className="w-5 h-5 text-gray-700" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={userName}
                                className="w-9 h-9 rounded-xl object-cover border border-white/60"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                                {userInitial}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside
                        className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl"
                        style={{ animation: 'slideInLeft 0.3s ease-out forwards' }}
                    >
                        {/* Mobile Sidebar Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-lg text-gray-900">Healthcare</span>
                                    <p className="text-xs text-gray-500">Booking System</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Mobile User Info */}
                        <div className="px-4 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={userName}
                                        className="w-12 h-12 rounded-2xl object-cover border border-white/40"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center font-semibold text-lg text-white">
                                        {userInitial}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user?.role === 'patient' ? 'Bệnh nhân' : user?.role === 'doctor' ? 'Bác sĩ' : 'Quản trị'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="px-4 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive(item.href) ? 'bg-white/20' : item.color
                                        }`}>
                                        <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : ''}`} />
                                    </div>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Bottom Actions */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white space-y-2">
                            <Link
                                to="/settings"
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <span>Cài đặt</span>
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setSidebarOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
