import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import {
    reportService,
    appointmentService,
    medicalRecordService,
    clinicService,
} from '../../services';
import {
    Calendar,
    Activity,
    Clock,
    ArrowRight,
    Building2,
    Stethoscope,
    ChevronRight,
    Plus,
    FileText,
    BarChart3,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcoming: 0,
        completed: 0,
        clinics: 0,
        records: 0
    });
    const [chartData, setChartData] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentRecords, setRecentRecords] = useState([]);
    const { error: showError } = useToast();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const todayIso = new Date().toISOString();
            const [
                upcomingRes,
                scheduledRes,
                confirmedRes,
                completedRes,
                clinicsRes,
                recordsRes,
                appointmentsReportRes
            ] = await Promise.all([
                appointmentService.getUpcomingAppointments(),
                appointmentService.getAppointments({ status: 'scheduled', startDate: todayIso, limit: 1 }),
                appointmentService.getAppointments({ status: 'confirmed', startDate: todayIso, limit: 1 }),
                appointmentService.getAppointments({ status: 'completed', limit: 1 }),
                clinicService.getClinics({ page: 1, limit: 1 }),
                medicalRecordService.getMedicalRecords({ page: 1, limit: 3 }),
                reportService.getAppointmentsReport()
            ]);

            const upcomingList = upcomingRes.success ? (upcomingRes.data || []) : [];
            setUpcomingAppointments(upcomingList.slice(0, 3));

            const scheduledTotal = scheduledRes.success ? (scheduledRes.pagination?.total || scheduledRes.data?.length || 0) : 0;
            const confirmedTotal = confirmedRes.success ? (confirmedRes.pagination?.total || confirmedRes.data?.length || 0) : 0;
            const completedTotal = completedRes.success ? (completedRes.pagination?.total || completedRes.data?.length || 0) : 0;
            const clinicsTotal = clinicsRes.success ? (clinicsRes.pagination?.total || clinicsRes.data?.length || 0) : 0;

            if (recordsRes.success) {
                const recordsList = recordsRes.data || [];
                setRecentRecords(recordsList.slice(0, 3));

                setStats({
                    upcoming: scheduledTotal + confirmedTotal,
                    completed: completedTotal,
                    clinics: clinicsTotal,
                    records: recordsRes.pagination?.total ?? recordsList.length
                });
            } else {
                setStats({
                    upcoming: scheduledTotal + confirmedTotal,
                    completed: completedTotal,
                    clinics: clinicsTotal,
                    records: 0
                });
            }

            if (appointmentsReportRes.success) {
                const chart = (appointmentsReportRes.data?.monthlyChart || []).map(item => ({
                    month: item.month
                        ? new Date(`${item.month}-01`).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
                        : '',
                    count: item.count || 0
                }));
                setChartData(chart);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            showError('Không thể tải dữ liệu tổng quan');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Xin chào! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Theo dõi sức khỏe của bạn tại đây
                    </p>
                </div>
                <Link
                    to="/booking"
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    Đặt lịch khám
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Total Appointments */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-400 before:to-blue-600 before:rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Lịch khám sắp tới</p>
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                                {stats.upcoming || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 flex items-center justify-center text-blue-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                            to="/appointments"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            Xem tất cả <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Medical Records */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-purple-400 before:to-purple-600 before:rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Hồ sơ bệnh án</p>
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                                {stats.records || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 flex items-center justify-center text-purple-600">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                            to="/records"
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                            Xem hồ sơ <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Total Completed */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-400 before:to-emerald-500 before:rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Đã khám xong</p>
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                                {stats.completed || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center text-emerald-500">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Tổng lượt khám đã hoàn thành
                        </p>
                    </div>
                </div>

                {/* Clinics Visited */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-400 before:to-amber-500 before:rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Phòng khám</p>
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                                {stats.clinics || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 flex items-center justify-center text-amber-500">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                            to="/clinics"
                            className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                            Tìm phòng khám <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Appointments Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Thống kê lịch khám</h2>
                            <p className="text-sm text-gray-500">6 tháng gần nhất</p>
                        </div>
                        <Link
                            to="/reports"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        >
                            Xem báo cáo
                        </Link>
                    </div>

                    {chartData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0077e6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#0077e6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#0077e6"
                                        strokeWidth={3}
                                        fill="url(#colorAppointments)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            Chưa có dữ liệu thống kê
                        </div>
                    )}
                </div>

                {/* Recent Records */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Hồ sơ bệnh án</h2>
                            <p className="text-sm text-gray-500">Gần đây nhất</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>

                    {recentRecords.length > 0 ? (
                        <div className="space-y-3">
                            {recentRecords.map((record) => (
                                <Link
                                    key={record._id}
                                    to="/records"
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-purple-50 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {record.diagnosis}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(record.recordDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">Chưa có hồ sơ bệnh án</p>
                        </div>
                    )}

                    <Link
                        to="/records"
                        className="w-full mt-4 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600 transition-all"
                    >
                        Xem tất cả hồ sơ
                    </Link>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Lịch khám sắp tới</h2>
                        <p className="text-sm text-gray-500">Các cuộc hẹn đã xác nhận</p>
                    </div>
                    <Link
                        to="/appointments"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    >
                        Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {upcomingAppointments.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingAppointments.map((apt, index) => (
                            <div
                                key={apt._id}
                                className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-100 hover:shadow-lg transition-all"
                                style={{ animation: `fadeIn 0.4s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                            >
                                <div className="flex items-start gap-4">
                                    {apt.doctorId?.avatar ? (
                                        <img
                                            src={apt.doctorId.avatar}
                                            alt={apt.doctorId?.fullName || 'B c si'}
                                            className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-blue-200 flex-shrink-0 border-2 border-white"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
                                            {apt.doctorId?.fullName ? (
                                                <span className="text-white text-lg font-bold">
                                                    {apt.doctorId.fullName.charAt(0).toUpperCase()}
                                                </span>
                                            ) : (
                                                <Stethoscope className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {apt.doctorId?.fullName || 'Bác sĩ'}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {apt.clinicId?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-blue-100">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium text-gray-900">
                                            {new Date(apt.appointmentDate).toLocaleDateString('vi-VN', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                        <span className="text-gray-500">lúc</span>
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium text-gray-900">{apt.timeSlot}</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${apt.status === 'confirmed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : apt.status === 'scheduled'
                                            ? 'bg-amber-100 text-amber-800'
                                            : apt.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : apt.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {apt.status === 'confirmed' ? 'Đã xác nhận' :
                                            apt.status === 'scheduled' ? 'Chờ xác nhận' :
                                                apt.status === 'completed' ? 'Đã hoàn thành' :
                                                    apt.status === 'cancelled' ? 'Đã hủy' : apt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Chưa có lịch khám</h3>
                        <p className="text-gray-500 mb-6">Đặt lịch khám ngay để chăm sóc sức khỏe</p>
                        <Link
                            to="/booking"
                            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            Đặt lịch ngay
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { to: '/clinics', icon: Building2, title: 'Phòng khám', desc: 'Tìm kiếm phòng khám', color: 'from-blue-500 to-blue-600' },
                    { to: '/records', icon: FileText, title: 'Hồ sơ bệnh án', desc: 'Xem lịch sử khám', color: 'from-purple-500 to-purple-600' },
                    { to: '/health', icon: Activity, title: 'Chỉ số sức khỏe', desc: 'Theo dõi sức khỏe', color: 'from-green-500 to-green-600' },
                    { to: '/reports', icon: BarChart3, title: 'Báo cáo', desc: 'Phân tích dữ liệu', color: 'from-amber-500 to-amber-600' },
                ].map((item, index) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="bg-white rounded-2xl shadow-lg p-5 group hover:scale-105 transition-transform"
                        style={{ animation: `fadeIn 0.4s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-4`}>
                            <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}



