import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
    Users,
    UserCog,
    Building2,
    Calendar,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { error: showError } = useToast();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            showError('Không thể tải dữ liệu', 'Vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statsCards = [
        {
            title: 'Tổng người dùng',
            value: stats?.stats?.totalUsers || 0,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            change: stats?.userGrowth?.growthRate || 0
        },
        {
            title: 'Phòng khám',
            value: stats?.stats?.totalClinics || 0,
            icon: Building2,
            color: 'from-violet-500 to-purple-500',
            bgColor: 'bg-violet-500/10',
            change: null
        },
        {
            title: 'Bác sĩ',
            value: stats?.stats?.totalDoctors || 0,
            icon: UserCog,
            color: 'from-teal-500 to-emerald-500',
            bgColor: 'bg-teal-500/10',
            change: null
        },
        {
            title: 'Lịch hẹn',
            value: stats?.stats?.totalAppointments || 0,
            icon: Calendar,
            color: 'from-orange-500 to-amber-500',
            bgColor: 'bg-orange-500/10',
            change: null
        }
    ];

    const appointmentStatusData = stats?.appointmentsByStatus ? [
        { name: 'Chờ xác nhận', value: stats.appointmentsByStatus.pending, color: '#f59e0b' },
        { name: 'Đã xác nhận', value: stats.appointmentsByStatus.confirmed, color: '#06b6d4' },
        { name: 'Hoàn thành', value: stats.appointmentsByStatus.completed, color: '#10b981' },
        { name: 'Đã hủy', value: stats.appointmentsByStatus.cancelled, color: '#ef4444' }
    ] : [];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'user_registered': return <Users className="w-4 h-4 text-blue-400" />;
            case 'appointment_created': return <Calendar className="w-4 h-4 text-orange-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Tổng quan hệ thống
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Chào mừng bạn đến với bảng điều khiển quản trị
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <div
                        key={stat.title}
                        className="relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-400">{stat.title}</p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {stat.value.toLocaleString()}
                                </p>
                                {stat.change !== null && (
                                    <div className={`flex items-center gap-1 mt-2 text-sm ${stat.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stat.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span>{stat.change >= 0 ? '+' : ''}{stat.change}%</span>
                                        <span className="text-slate-500">tháng này</span>
                                    </div>
                                )}
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('violet') ? '#8b5cf6' : stat.color.includes('teal') ? '#14b8a6' : '#f97316' }} />
                            </div>
                        </div>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
                    </div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-yellow-500">{stats?.stats?.pendingAppointments || 0}</p>
                        <p className="text-sm text-yellow-500/70">Lịch chờ xác nhận</p>
                    </div>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-emerald-500">{stats?.stats?.todayAppointments || 0}</p>
                        <p className="text-sm text-emerald-500/70">Lịch hôm nay</p>
                    </div>
                </div>
                <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-500">{stats?.userGrowth?.thisMonth || 0}</p>
                        <p className="text-sm text-blue-500/70">Người dùng mới tháng này</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Status Chart */}
                <div className="rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Trạng thái lịch hẹn</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={appointmentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {appointmentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {appointmentStatusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm text-slate-400">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Hoạt động gần đây</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center shrink-0">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-300 truncate">{activity.message}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatTime(activity.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                Chưa có hoạt động nào
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
