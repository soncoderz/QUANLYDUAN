import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Stethoscope
} from 'lucide-react';

const menuItems = [
    { path: '/doctor', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/doctor/appointments', icon: Calendar, label: 'Lịch hẹn' },
    { path: '/doctor/patients', icon: Users, label: 'Bệnh nhân' },
    { path: '/doctor/settings', icon: Settings, label: 'Cài đặt' }
];

export default function DoctorLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const { user, profile, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const loadDoctor = async () => {
            try {
                const res = await api.get('/doctors/dashboard');
                if (res.data?.success) {
                    setDoctorInfo(res.data.data?.doctor);
                }
            } catch (err) {
                console.error('Load doctor info failed', err);
            }
        };
        loadDoctor();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
                    <Link to="/doctor" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-white">Doctor Panel</span>
                            <p className="text-xs text-slate-400">Healthcare System</p>
                        </div>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Doctor Info */}
                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        {doctorInfo?.avatar || profile?.avatar ? (
                            <img
                                src={doctorInfo?.avatar || profile?.avatar}
                                alt={doctorInfo?.fullName || profile?.fullName || 'Doctor'}
                                className="w-12 h-12 rounded-xl object-cover border border-teal-500/40"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-lg font-bold text-teal-400 border border-teal-500/30">
                                {(doctorInfo?.fullName || profile?.fullName || 'D').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{doctorInfo?.fullName || profile?.fullName || user?.email}</p>
                            <p className="text-xs text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                Bác sĩ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Menu chính</p>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-700/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 h-16 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-4">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white">Doctor Panel</span>
                    </div>
                    <div className="w-10" />
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
