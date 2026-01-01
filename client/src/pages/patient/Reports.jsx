import { useState, useEffect } from 'react';
import { reportService } from '../../services';
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Calendar,
    Pill,
    Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from 'recharts';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('adherence');
    const [loading, setLoading] = useState(true);
    const [adherenceData, setAdherenceData] = useState(null);
    const [metricData, setMetricData] = useState(null);
    const [appointmentData, setAppointmentData] = useState(null);

    const COLORS = ['#22c55e', '#ef4444', '#0ea5e9', '#f59e0b'];

    useEffect(() => {
        fetchReportData();
    }, [activeTab]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'adherence':
                    const adherenceRes = await reportService.getMedicationAdherenceReport();
                    if (adherenceRes.success) setAdherenceData(adherenceRes.data);
                    break;
                case 'metrics':
                    const metricRes = await reportService.getMetricTrendsReport();
                    if (metricRes.success) setMetricData(metricRes.data);
                    break;
                case 'appointments':
                    const aptRes = await reportService.getAppointmentsReport();
                    if (aptRes.success) setAppointmentData(aptRes.data);
                    break;
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'adherence', label: 'Tuân thủ thuốc', icon: Pill },
        { id: 'metrics', label: 'Xu hướng chỉ số', icon: Activity },
        { id: 'appointments', label: 'Tần suất khám', icon: Calendar },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="mb-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Báo cáo</h1>
                <p className="text-gray-500">Phân tích dữ liệu sức khỏe của bạn</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Medication Adherence Report */}
                    {activeTab === 'adherence' && adherenceData && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">Tỷ lệ tuân thủ</p>
                                    <p className="text-3xl font-bold text-green-600">{adherenceData.overallAdherence}%</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">Tổng lần uống</p>
                                    <p className="text-3xl font-bold text-gray-900">{adherenceData.totalScheduled}</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">Đã uống</p>
                                    <p className="text-3xl font-bold text-sky-600">{adherenceData.totalTaken}</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">Bỏ lỡ</p>
                                    <p className="text-3xl font-bold text-red-500">{adherenceData.totalMissed}</p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ uống thuốc</h2>
                                <div className="h-64 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPie>
                                            <Pie
                                                data={[
                                                    { name: 'Đã uống', value: adherenceData.chartData.taken },
                                                    { name: 'Bỏ lỡ', value: adherenceData.chartData.missed },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                <Cell fill="#22c55e" />
                                                <Cell fill="#ef4444" />
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Medication Details */}
                            {adherenceData.medications?.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết từng thuốc</h2>
                                    <div className="space-y-4">
                                        {adherenceData.medications.map((med, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-gray-900">{med.medication.name}</p>
                                                    <p className="text-sm text-gray-500">{med.medication.dosage} - {med.medication.frequency}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${med.adherenceRate >= 80 ? 'text-green-600' : med.adherenceRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {med.adherenceRate}%
                                                    </p>
                                                    <p className="text-sm text-gray-500">{med.totalTaken}/{med.totalScheduled} lần</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metric Trends Report */}
                    {activeTab === 'metrics' && metricData && (
                        <div className="space-y-6">
                            {/* Summary */}
                            {metricData.summary?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {metricData.summary.map((item) => (
                                        <div key={item.metricType} className="bg-white rounded-2xl shadow-lg p-5">
                                            <p className="text-sm text-gray-500 capitalize mb-2">
                                                {item.metricType.replace('_', ' ')}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {item.average} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
                                            </p>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                                <span>Min: {item.min}</span>
                                                <span>Max: {item.max}</span>
                                            </div>
                                            {item.standardRange && (
                                                <p className="text-xs text-sky-600 mt-2">
                                                    Chuẩn: {item.standardRange.min} - {item.standardRange.max} {item.standardRange.unit}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Charts */}
                            {Object.keys(metricData.chartData || {}).map((type) => (
                                <div key={type} className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                                        Xu hướng {type.replace('_', ' ')}
                                    </h2>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={metricData.chartData[type]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Appointments Report */}
                    {activeTab === 'appointments' && appointmentData && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">Tổng lượt khám</p>
                                    <p className="text-3xl font-bold text-gray-900">{appointmentData.totalAppointments}</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">Hoàn thành</p>
                                    <p className="text-3xl font-bold text-green-600">{appointmentData.completedAppointments}</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">Đã hủy</p>
                                    <p className="text-3xl font-bold text-red-500">{appointmentData.cancelledAppointments}</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <p className="text-sm text-gray-500">TB/tháng</p>
                                    <p className="text-3xl font-bold text-sky-600">{appointmentData.averagePerMonth}</p>
                                </div>
                            </div>

                            {/* Monthly Chart */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Số lượt khám theo tháng</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={appointmentData.monthlyChart}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* By Type */}
                            {appointmentData.byType && Object.keys(appointmentData.byType).length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo loại khám</h2>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPie>
                                                <Pie
                                                    data={Object.entries(appointmentData.byType).map(([name, value]) => ({ name, value }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {Object.keys(appointmentData.byType).map((_, idx) => (
                                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </RechartsPie>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
