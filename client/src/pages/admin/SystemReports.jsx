import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
    BarChart3,
    Users,
    Calendar,
    Building2,
    Download,
    TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function SystemReports() {
    const [reportType, setReportType] = useState('overview');
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [overviewData, setOverviewData] = useState(null);
    const [appointmentData, setAppointmentData] = useState(null);
    const { error: showError } = useToast();

    useEffect(() => {
        fetchReportData();
    }, [reportType, year]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            if (reportType === 'overview') {
                const response = await adminService.getOverviewReport({ year });
                if (response.success) {
                    setOverviewData(response.data);
                }
            } else if (reportType === 'appointments') {
                const response = await adminService.getAppointmentReport({ year });
                if (response.success) {
                    setAppointmentData(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            showError('Không thể tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        { id: 'overview', label: 'Tổng quan', icon: BarChart3, color: 'from-violet-500 to-purple-600' },
        { id: 'appointments', label: 'Lịch hẹn', icon: Calendar, color: 'from-orange-500 to-amber-600' },
    ];

    const years = [2024, 2025, 2026];

    const renderOverviewReport = () => {
        if (!overviewData) return null;

        const { appointmentsByMonth, usersByMonth } = overviewData;
        const totalAppointments = appointmentsByMonth.reduce((sum, m) => sum + m.count, 0);
        const totalUsers = usersByMonth.reduce((sum, m) => sum + m.count, 0);

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Tổng lịch hẹn năm {year}</p>
                                <p className="text-3xl font-bold text-white">{totalAppointments.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                <Users className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Người dùng mới năm {year}</p>
                                <p className="text-3xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Chart */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Lịch hẹn theo tháng</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={appointmentsByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Users Chart */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Người dùng mới theo tháng</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={usersByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#06b6d4"
                                    strokeWidth={3}
                                    dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderAppointmentReport = () => {
        if (!appointmentData) return null;

        const { byStatus, bySpecialty } = appointmentData;

        const statusLabels = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };

        const statusData = byStatus.map(item => ({
            name: statusLabels[item._id] || item._id,
            value: item.count
        }));

        const specialtyData = bySpecialty.map(item => ({
            name: item._id || 'Khác',
            value: item.count
        }));

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* By Status */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Theo trạng thái</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                            {statusData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm text-slate-400">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* By Specialty */}
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6">Theo chuyên khoa</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={specialtyData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={100} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Tổng kết</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {statusData.map((item, index) => (
                            <div key={item.name} className="text-center p-4 rounded-xl bg-slate-700/30">
                                <p className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                                    {item.value}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Báo cáo hệ thống</h1>
                    <p className="text-slate-400 mt-1">Thống kê và phân tích dữ liệu hệ thống</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div className="flex flex-wrap gap-4">
                {reportTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setReportType(type.id)}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all ${reportType === type.id
                            ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                            }`}
                    >
                        <type.icon className="w-5 h-5" />
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {reportType === 'overview' && renderOverviewReport()}
                    {reportType === 'appointments' && renderAppointmentReport()}
                </>
            )}
        </div>
    );
}
