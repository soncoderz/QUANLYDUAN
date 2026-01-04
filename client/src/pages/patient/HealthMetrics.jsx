import { useState, useEffect } from 'react';
import { healthMetricService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
    Activity,
    Plus,
    Heart,
    Scale,
    Droplet,
    Thermometer,
    TrendingUp,
    TrendingDown,
    X,
    Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function HealthMetrics() {
    const [metrics, setMetrics] = useState([]);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedType, setSelectedType] = useState('weight');
    const { success, error: showError } = useToast();

    const [newMetric, setNewMetric] = useState({
        metricType: 'weight',
        value: '',
        secondaryValue: '',
        unit: 'kg',
        notes: '',
    });

    const metricTypes = [
        { value: 'weight', label: 'Cân nặng', unit: 'kg', icon: Scale, color: 'from-blue-600 to-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { value: 'blood_pressure', label: 'Huyết áp', unit: 'mmHg', icon: Heart, hasSecondary: true, color: 'from-blue-600 to-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { value: 'glucose', label: 'Đường huyết', unit: 'mg/dL', icon: Droplet, color: 'from-blue-600 to-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { value: 'heart_rate', label: 'Nhịp tim', unit: 'bpm', icon: Heart, color: 'from-blue-600 to-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
        { value: 'temperature', label: 'Nhiệt độ', unit: '°C', icon: Thermometer, color: 'from-blue-600 to-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    ];

    useEffect(() => {
        fetchData();
    }, [selectedType]);

    const fetchData = async () => {
        try {
            const [metricsRes, trendsRes] = await Promise.all([
                healthMetricService.getHealthMetrics({ metricType: selectedType }),
                healthMetricService.getHealthMetricTrends({ metricType: selectedType, period: '3m' }),
            ]);

            if (metricsRes.success) {
                setMetrics(metricsRes.data);
            }
            if (trendsRes.success) {
                setTrends(trendsRes.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMetric = async () => {
        if (!newMetric.value) {
            showError('Vui lòng nhập giá trị');
            return;
        }

        try {
            const data = {
                ...newMetric,
                value: parseFloat(newMetric.value),
                secondaryValue: newMetric.secondaryValue ? parseFloat(newMetric.secondaryValue) : undefined,
            };

            const response = await healthMetricService.createHealthMetric(data);
            if (response.success) {
                success('Đã ghi nhận chỉ số sức khỏe! 📊');
                fetchData();
                setShowAddModal(false);
                setNewMetric({
                    metricType: 'weight',
                    value: '',
                    secondaryValue: '',
                    unit: 'kg',
                    notes: '',
                });
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể thêm chỉ số');
        }
    };

    const handleTypeChange = (type) => {
        const typeConfig = metricTypes.find((t) => t.value === type);
        setNewMetric({
            ...newMetric,
            metricType: type,
            unit: typeConfig?.unit || '',
            secondaryValue: '',
        });
    };

    const getTypeConfig = (type) => {
        return metricTypes.find((t) => t.value === type) || metricTypes[0];
    };

    const currentTypeConfig = getTypeConfig(selectedType);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="mb-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Chỉ số sức khỏe</h1>
                    <p className="text-gray-500">Theo dõi và ghi nhận các chỉ số sức khỏe của bạn</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    Thêm chỉ số
                </button>
            </div>

            {/* Type Selector */}
            <div className="flex flex-wrap gap-2">
                {metricTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedType === type.value
                                ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {type.label}
                        </button>
                    );
                })}
            </div>

            {/* Stats Cards */}
            {trends?.summary?.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {trends.summary.map((item) => {
                        const config = getTypeConfig(item.metricType);
                        const Icon = config.icon;

                        return (
                            <div key={item.metricType} className="bg-white rounded-2xl shadow-lg p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${config.textColor}`} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Trung bình</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {item.average}
                                    <span className="text-sm font-normal text-gray-500 ml-1">{item.unit}</span>
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3 text-blue-500" />
                                        Min: {item.min}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                        Max: {item.max}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Chart */}
            {trends?.chartData?.[selectedType]?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Biểu đồ xu hướng</h2>
                            <p className="text-sm text-gray-500">3 tháng gần nhất</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${currentTypeConfig.bgColor} flex items-center justify-center`}>
                            <currentTypeConfig.icon className={`w-5 h-5 ${currentTypeConfig.textColor}`} />
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends.chartData[selectedType]}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0077e6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0077e6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
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
                                    dataKey="value"
                                    stroke="#0077e6"
                                    strokeWidth={3}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Lịch sử đo</h2>
                        <p className="text-sm text-gray-500">{currentTypeConfig.label}</p>
                    </div>
                </div>

                {metrics.length > 0 ? (
                    <div className="space-y-3">
                        {metrics.slice(0, 10).map((metric, index) => {
                            const config = getTypeConfig(metric.metricType);
                            const Icon = config.icon;

                            return (
                                <div
                                    key={metric._id}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                                    style={{ animation: `fadeIn 0.4s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                                            <Icon className={`w-6 h-6 ${config.textColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">
                                                {metric.value}
                                                {metric.secondaryValue && `/${metric.secondaryValue}`}
                                                <span className="text-sm text-gray-500 font-normal ml-1">{metric.unit}</span>
                                            </p>
                                            {metric.notes && (
                                                <p className="text-sm text-gray-500">{metric.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(metric.measuredAt).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(metric.measuredAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Activity className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu</h3>
                        <p className="text-gray-500 mb-6">Bắt đầu ghi nhận chỉ số {currentTypeConfig.label.toLowerCase()} của bạn</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            Thêm chỉ số đầu tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Add Metric Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                    onClick={() => setShowAddModal(false)}
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Thêm chỉ số sức khỏe</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại chỉ số</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {metricTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.value}
                                                onClick={() => handleTypeChange(type.value)}
                                                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${newMetric.metricType === type.value
                                                    ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {type.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giá trị {newMetric.metricType === 'blood_pressure' ? '(Tâm thu)' : ''}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={newMetric.value}
                                            onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                                            className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {getTypeConfig(newMetric.metricType)?.unit}
                                        </span>
                                    </div>
                                </div>

                                {metricTypes.find((t) => t.value === newMetric.metricType)?.hasSecondary && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tâm trương</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={newMetric.secondaryValue}
                                                onChange={(e) => setNewMetric({ ...newMetric, secondaryValue: e.target.value })}
                                                className="w-full px-4 py-3.5 pr-16 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">mmHg</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={newMetric.notes}
                                    onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="VD: Đo sau bữa sáng"
                                />
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-700">
                                    Ghi nhận chỉ số thường xuyên giúp bạn theo dõi sức khỏe tốt hơn và phát hiện sớm các vấn đề
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddMetric}
                                disabled={!newMetric.value}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                                Lưu chỉ số
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
