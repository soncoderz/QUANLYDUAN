import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
    Calendar,
    Users,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
    ChevronRight,
    Stethoscope,
    User
} from 'lucide-react';

export default function DoctorDashboard() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/doctors/dashboard');
            if (response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    };

    const formatTime = (slot) => {
        if (!slot) return '';
        const [hours] = slot.split(':');
        return `${hours}:00`;
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
            cancelled: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: 'Đã lên lịch',
            confirmed: 'Đã xác nhận',
            pending: 'Chờ xử lý',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const stats = dashboardData?.stats || {};
    const doctor = dashboardData?.doctor || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        Xin chào, BS. {doctor.fullName?.split(' ').pop() || 'Bác sĩ'} 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {doctor.specialty || 'Chuyên khoa'} • {doctor.clinic?.name || 'Phòng khám'}
                    </p>
                </div>
                <Link
                    to="/doctor/appointments"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                >
                    <Calendar className="w-5 h-5" />
                    Xem tất cả lịch hẹn
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-teal-400" />
                        </div>
                        <p className="text-sm text-slate-400">Hôm nay</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.todayCount || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">lịch hẹn</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <p className="text-sm text-slate-400">Chờ xử lý</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.pendingCount || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">cần xác nhận</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-sm text-slate-400">Tháng này</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.completedThisMonth || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">hoàn thành</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-violet-400" />
                        </div>
                        <p className="text-sm text-slate-400">Bệnh nhân</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalPatients || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">tổng số</p>
                </div>
            </div>

            {/* Today's Appointments & Pending */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">Lịch hẹn hôm nay</h2>
                                <p className="text-xs text-slate-400">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-700/50 max-h-[400px] overflow-y-auto">
                        {dashboardData?.todayAppointments?.length > 0 ? (
                            dashboardData.todayAppointments.map((apt) => (
                                <div key={apt._id} className="p-4 hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {apt.patientProfile?.avatar ? (
                                            <img
                                                src={apt.patientProfile.avatar}
                                                alt={apt.patientProfile.fullName || 'Bệnh nhân'}
                                                className="w-12 h-12 rounded-xl object-cover border border-teal-500/30"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                                <User className="w-5 h-5 text-teal-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">
                                                {apt.patientProfile?.fullName || apt.patientId?.email || 'Bệnh nhân'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-slate-400">
                                                    {formatTime(apt.timeSlot)}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                                                    {getStatusLabel(apt.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">Không có lịch hẹn hôm nay</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Appointments */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">Chờ xác nhận</h2>
                                <p className="text-xs text-slate-400">Lịch hẹn cần xử lý</p>
                            </div>
                        </div>
                        <Link to="/doctor/appointments?status=pending" className="text-sm text-teal-400 hover:text-teal-300">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-700/50 max-h-[400px] overflow-y-auto">
                        {dashboardData?.pendingAppointments?.length > 0 ? (
                            dashboardData.pendingAppointments.map((apt) => (
                                <div key={apt._id} className="p-4 hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {apt.patientProfile?.avatar ? (
                                            <img
                                                src={apt.patientProfile.avatar}
                                                alt={apt.patientProfile.fullName || 'Bệnh nhân'}
                                                className="w-12 h-12 rounded-xl object-cover border border-amber-500/30"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                                                <User className="w-5 h-5 text-amber-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">
                                                {apt.patientProfile?.fullName || apt.patientId?.email || 'Bệnh nhân'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-slate-400">
                                                    {formatDate(apt.appointmentDate)} • {formatTime(apt.timeSlot)}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                                <p className="text-slate-400">Không có lịch hẹn chờ xử lý</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-2xl p-6 border border-teal-500/20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Hiệu suất tháng này</h3>
                            <p className="text-slate-400">
                                {stats.completedThisMonth || 0} / {stats.totalThisMonth || 0} lịch hẹn hoàn thành
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-3xl font-bold text-teal-400">
                                {stats.totalThisMonth > 0 ? Math.round((stats.completedThisMonth / stats.totalThisMonth) * 100) : 0}%
                            </p>
                            <p className="text-sm text-slate-400">Tỷ lệ hoàn thành</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
