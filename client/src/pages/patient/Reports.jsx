import { useState, useEffect } from 'react';
import { reportService, medicalRecordService } from '../../services';
import {
    BarChart3,
    Calendar,
    Activity,
    FileText,
    Stethoscope,
    TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from 'recharts';

export default function Reports() {
    const [activeTab, setActiveTab] = useState('appointments');
    const [loading, setLoading] = useState(true);
    const [metricData, setMetricData] = useState(null);
    const [appointmentData, setAppointmentData] = useState(null);
    const [recordStats, setRecordStats] = useState(null);

    const COLORS = ['#22c55e', '#ef4444', '#0ea5e9', '#f59e0b', '#8b5cf6'];

    useEffect(() => {
        fetchReportData();
    }, [activeTab]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'appointments':
                    const aptRes = await reportService.getAppointmentsReport();
                    if (aptRes.success) setAppointmentData(aptRes.data);
                    break;
                case 'metrics':
                    const metricRes = await reportService.getMetricTrendsReport();
                    if (metricRes.success) setMetricData(metricRes.data);
                    break;
                case 'records':
                    const recordsRes = await medicalRecordService.getMedicalRecords();
                    if (recordsRes.success) {
                        const records = recordsRes.data;
                        // Calculate stats from records
                        const doctorSet = new Set(records.map(r => r.doctorId?._id).filter(Boolean));
                        const totalPrescriptions = records.reduce((sum, r) => sum + (r.prescriptions?.length || 0), 0);

                        // Group by month
                        const monthlyData = {};
                        records.forEach(r => {
                            const date = new Date(r.recordDate);
                            const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
                            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
                        });

                        const chartData = Object.entries(monthlyData)
                            .map(([month, count]) => ({ month, count }))
                            .slice(-6);

                        setRecordStats({
                            total: records.length,
                            doctors: doctorSet.size,
                            prescriptions: totalPrescriptions,
                            records: records,
                            chartData
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'appointments', label: 'Tần suất khám', icon: Calendar },
        { id: 'records', label: 'Hồ sơ bệnh án', icon: FileText },
        { id: 'metrics', label: 'Xu hướng chỉ số', icon: Activity },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="mb-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Báo cáo</h1>
                <p className="text-gray-500">Phân tích dữ liệu sức khỏe của bạn</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
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
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Pie Chart */}
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPie>
                                                    <Pie
                                                        data={Object.entries(appointmentData.byType).map(([name, value]) => {
                                                            const typeLabels = {
                                                                'checkup': 'Khám tổng quát',
                                                                'consultation': 'Tư vấn',
                                                                'follow-up': 'Tái khám',
                                                                'follow_up': 'Tái khám'
                                                            };
                                                            return {
                                                                name: typeLabels[name] || name,
                                                                value,
                                                                originalName: name
                                                            };
                                                        })}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={90}
                                                        dataKey="value"
                                                        label={false}
                                                    >
                                                        {Object.keys(appointmentData.byType).map((_, idx) => (
                                                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value, name) => [value + ' lượt', name]}
                                                    />
                                                </RechartsPie>
                                            </ResponsiveContainer>
                                        </div>
                                        {/* Legend */}
                                        <div className="flex flex-col justify-center space-y-3">
                                            {Object.entries(appointmentData.byType).map(([name, value], idx) => {
                                                const typeLabels = {
                                                    'checkup': 'Khám tổng quát',
                                                    'consultation': 'Tư vấn',
                                                    'follow-up': 'Tái khám',
                                                    'follow_up': 'Tái khám'
                                                };
                                                const total = Object.values(appointmentData.byType).reduce((a, b) => a + b, 0);
                                                const percent = ((value / total) * 100).toFixed(0);
                                                return (
                                                    <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <div
                                                            className="w-4 h-4 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{typeLabels[name] || name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-900">{value} lượt</p>
                                                            <p className="text-sm text-gray-500">{percent}%</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Medical Records Report */}
                    {activeTab === 'records' && recordStats && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-5 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white/80 text-sm">Tổng hồ sơ</p>
                                            <p className="text-3xl font-bold mt-1">{recordStats.total}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm">Bác sĩ đã khám</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{recordStats.doctors}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                                            <Stethoscope className="w-6 h-6 text-teal-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-lg p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 text-sm">Đơn thuốc đã kê</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-1">{recordStats.prescriptions}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-amber-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            {recordStats.chartData?.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Hồ sơ theo tháng</h2>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={recordStats.chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Recent Records */}
                            {recordStats.records?.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Các hồ sơ gần đây</h2>
                                    <div className="space-y-3">
                                        {recordStats.records.slice(0, 5).map((record, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{record.diagnosis}</p>
                                                        <p className="text-sm text-gray-500">{record.doctorId?.fullName || 'Bác sĩ'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(record.recordDate).toLocaleDateString('vi-VN')}
                                                    </p>
                                                    {record.prescriptions?.length > 0 && (
                                                        <p className="text-xs text-purple-600">{record.prescriptions.length} loại thuốc</p>
                                                    )}
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

                            {/* Empty state */}
                            {(!metricData.summary || metricData.summary.length === 0) && (
                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                                        <Activity className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu</h3>
                                    <p className="text-gray-500">Hãy bắt đầu ghi nhận chỉ số sức khỏe của bạn</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
