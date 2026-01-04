import { useState, useEffect } from 'react';
import { medicalRecordService } from '../../services';
import {
    FileText,
    Calendar,
    User,
    ChevronRight,
    Stethoscope,
    ClipboardList,
    Heart,
    Thermometer,
    Activity,
    X,
    Pill
} from 'lucide-react';

export default function MedicalRecords() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await medicalRecordService.getMedicalRecords();
            if (response.success) {
                setRecords(response.data);
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

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
        <div className="max-w-5xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Hồ sơ bệnh án</h1>
                <p className="text-gray-500">Xem lịch sử khám và chẩn đoán của bạn</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Tổng số hồ sơ</p>
                            <p className="text-3xl font-bold mt-1">{records.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Đơn thuốc đã kê</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {records.reduce((sum, r) => sum + (r.prescriptions?.length || 0), 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Pill className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Bác sĩ đã khám</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {new Set(records.map(r => r.doctorId?._id).filter(Boolean)).size}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-teal-600" />
                        </div>
                    </div>
                </div>
            </div>

            {records.length > 0 ? (
                <div className="grid gap-4">
                    {records.map((record, index) => (
                        <div
                            key={record._id}
                            onClick={() => handleRecordClick(record)}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transition-all p-5 sm:p-6 group"
                            style={{ animation: `fadeIn 0.4s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                                    <FileText className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                                        {record.diagnosis}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <User className="w-4 h-4 text-indigo-400" />
                                            <span>{record.doctorId?.fullName || 'Bác sĩ'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 text-indigo-400" />
                                            <span>
                                                {new Date(record.recordDate).toLocaleDateString('vi-VN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {record.symptoms && (
                                        <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                                            <span className="font-medium text-gray-700">Triệu chứng:</span> {record.symptoms}
                                        </p>
                                    )}
                                </div>

                                {/* Arrow */}
                                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <ClipboardList className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Chưa có hồ sơ bệnh án
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Hồ sơ bệnh án sẽ được tạo sau khi bạn hoàn thành các buổi khám bệnh
                    </p>
                </div>
            )}

            {/* Record Detail Modal */}
            {showModal && selectedRecord && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">{selectedRecord.diagnosis}</h2>
                                    <p className="text-white/80 text-sm">
                                        {new Date(selectedRecord.recordDate).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-6">
                                {/* Doctor Info */}
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                        <Stethoscope className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bác sĩ điều trị</p>
                                        <p className="font-semibold text-gray-900">
                                            {selectedRecord.doctorId?.fullName} - {selectedRecord.doctorId?.specialty}
                                        </p>
                                    </div>
                                </div>

                                {/* Sections */}
                                {selectedRecord.symptoms && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Triệu chứng</h4>
                                        <p className="text-gray-900 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                            {selectedRecord.symptoms}
                                        </p>
                                    </div>
                                )}

                                {selectedRecord.treatment && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Phương pháp điều trị</h4>
                                        <p className="text-gray-900 bg-green-50 p-4 rounded-xl border border-green-100">
                                            {selectedRecord.treatment}
                                        </p>
                                    </div>
                                )}

                                {selectedRecord.doctorNotes && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Ghi chú bác sĩ</h4>
                                        <p className="text-gray-900 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            {selectedRecord.doctorNotes}
                                        </p>
                                    </div>
                                )}

                                {/* Vital Signs */}
                                {selectedRecord.vitalSigns && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Chỉ số sức khỏe</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {selectedRecord.vitalSigns.bloodPressure && (
                                                <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 text-center">
                                                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-500">Huyết áp</p>
                                                    <p className="font-bold text-gray-900">{selectedRecord.vitalSigns.bloodPressure}</p>
                                                    <p className="text-xs text-gray-400">mmHg</p>
                                                </div>
                                            )}
                                            {selectedRecord.vitalSigns.heartRate && (
                                                <div className="p-4 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border border-rose-100 text-center">
                                                    <Activity className="w-5 h-5 text-rose-500 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-500">Nhịp tim</p>
                                                    <p className="font-bold text-gray-900">{selectedRecord.vitalSigns.heartRate}</p>
                                                    <p className="text-xs text-gray-400">bpm</p>
                                                </div>
                                            )}
                                            {selectedRecord.vitalSigns.temperature && (
                                                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 text-center">
                                                    <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-500">Nhiệt độ</p>
                                                    <p className="font-bold text-gray-900">{selectedRecord.vitalSigns.temperature}</p>
                                                    <p className="text-xs text-gray-400">°C</p>
                                                </div>
                                            )}
                                            {selectedRecord.vitalSigns.weight && (
                                                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 text-center">
                                                    <User className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                                                    <p className="text-xs text-gray-500">Cân nặng</p>
                                                    <p className="font-bold text-gray-900">{selectedRecord.vitalSigns.weight}</p>
                                                    <p className="text-xs text-gray-400">kg</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Prescriptions */}
                                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            Đơn thuốc ({selectedRecord.prescriptions.length} loại)
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedRecord.prescriptions.map((med, idx) => (
                                                <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                            <Pill className="w-5 h-5 text-purple-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900">{med.name}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {med.dosage && (
                                                                    <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-200">
                                                                        💊 {med.dosage}
                                                                    </span>
                                                                )}
                                                                {med.frequency && (
                                                                    <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-200">
                                                                        🕐 {med.frequency}
                                                                    </span>
                                                                )}
                                                                {med.duration && (
                                                                    <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-200">
                                                                        📅 {med.duration}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {med.instructions && (
                                                                <p className="text-sm text-gray-500 mt-2 italic">
                                                                    ℹ️ {med.instructions}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
