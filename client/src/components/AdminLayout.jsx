import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    LayoutDashboard,
    Users,
    UserCog,
    Building2,
    Calendar,
    BarChart3,
    LogOut,
    Menu,
    X,
    Shield,
    ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
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
        { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard, color: 'text-blue-600 bg-blue-100' },
        { name: 'Quản lý người dùng', href: '/admin/users', icon: Users, color: 'text-indigo-600 bg-indigo-100' },
        { name: 'Quản lý bác sĩ', href: '/admin/doctors', icon: UserCog, color: 'text-teal-600 bg-teal-100' },
        { name: 'Quản lý phòng khám', href: '/admin/clinics', icon: Building2, color: 'text-purple-600 bg-purple-100' },
        { name: 'Quản lý lịch hẹn', href: '/admin/appointments', icon: Calendar, color: 'text-orange-600 bg-orange-100' },
        { name: 'Báo cáo hệ thống', href: '/admin/reports', icon: BarChart3, color: 'text-pink-600 bg-pink-100' },
    ];

    const isActive = (href) => {
        if (href === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(href);
    };

    const userName = user?.email?.split('@')[0] || 'Admin';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700/50">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-xl text-white">Admin Panel</span>
                        <p className="text-xs text-slate-400">Healthcare System</p>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-4 py-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-700/30">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-semibold text-lg text-white shrink-0 shadow-md">
                            {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {userName}
                            </p>
                            <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Quản trị viên
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Quản lý hệ thống
                    </p>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.href)
                                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                                : 'text-slate-300 hover:bg-slate-700/50'
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
                <div className="p-4 border-t border-slate-700/50 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <LogOut className="w-5 h-5 text-red-400" />
                        </div>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-white">Admin</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {userInitial}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside
                        className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-800 shadow-2xl"
                        style={{ animation: 'slideInLeft 0.3s ease-out forwards' }}
                    >
                        {/* Mobile Sidebar Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-lg text-white">Admin Panel</span>
                                    <p className="text-xs text-slate-400">Healthcare System</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Mobile User Info */}
                        <div className="px-4 py-4 border-b border-slate-700">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-700/50">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-semibold text-lg text-white">
                                    {userInitial}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                                    <p className="text-xs text-slate-400 capitalize">Quản trị viên</p>
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
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                                        : 'text-slate-300 hover:bg-slate-700/50'
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
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800 space-y-2">
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setSidebarOpen(false);
                                }}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
                            >
                                <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
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
