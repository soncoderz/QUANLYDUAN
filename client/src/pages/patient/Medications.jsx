import { useState, useEffect } from 'react';
import { medicationService, reminderService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
    Pill,
    Plus,
    Clock,
    Calendar,
    Check,
    Bell,
    X,
    AlertCircle,
    ChevronRight,
    Trash2
} from 'lucide-react';

export default function Medications() {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const { success, error: showError, info } = useToast();

    const [newMedication, setNewMedication] = useState({
        name: '',
        dosage: '',
        frequency: '',
        instructions: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
    });

    const [newReminder, setNewReminder] = useState({
        reminderTime: '08:00',
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const response = await medicationService.getMedications({ active: 'true' });
            if (response.success) {
                setMedications(response.data);
            }
        } catch (error) {
            console.error('Error fetching medications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedication = async () => {
        if (!newMedication.name.trim()) {
            showError('Vui lòng nhập tên thuốc');
            return;
        }

        try {
            const response = await medicationService.createMedication(newMedication);
            if (response.success) {
                success('Đã thêm thuốc vào tủ thuốc của bạn');
                fetchMedications();
                setShowAddModal(false);
                setNewMedication({
                    name: '',
                    dosage: '',
                    frequency: '',
                    instructions: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                });
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể thêm thuốc');
        }
    };

    const handleAddReminder = async () => {
        if (!selectedMedication) return;

        try {
            const response = await medicationService.createReminder(selectedMedication._id, newReminder);
            if (response.success) {
                success('Đã thêm lời nhắc uống thuốc');
                fetchMedications();
                setShowReminderModal(false);
                setSelectedMedication(null);
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể thêm nhắc nhở');
        }
    };

    const handleMarkTaken = async (reminderId) => {
        try {
            await reminderService.markReminderTaken(reminderId);
            success('Đã ghi nhận uống thuốc! ');
            fetchMedications();
        } catch (error) {
            showError('Không thể cập nhật');
        }
    };

    const handleDeleteMedication = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa thuốc này khỏi danh sách?')) return;

        try {
            await medicationService.deleteMedication(id);
            success('Đã xóa thuốc khỏi danh sách');
            fetchMedications();
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể xóa thuốc');
        }
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
        <div className="max-w-4xl mx-auto space-y-6" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="mb-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Tủ thuốc</h1>
                    <p className="text-gray-500">Quản lý thuốc và lời nhắc uống thuốc</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Plus className="w-5 h-5" />
                    Thêm thuốc
                </button>
            </div>

            {/* Medications List */}
            {medications.length > 0 ? (
                <div className="space-y-4">
                    {medications.map((med, index) => (
                        <div
                            key={med._id}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 sm:p-6"
                            style={{ animation: `fadeIn 0.4s ease-out ${index * 0.05}s forwards`, opacity: 0 }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* Icon */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200 flex-shrink-0">
                                        <Pill className="w-7 h-7 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-lg">{med.name}</h3>
                                        <p className="text-gray-500">{med.dosage} - {med.frequency}</p>

                                        {med.instructions && (
                                            <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                <p className="text-sm text-amber-700 flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                    {med.instructions}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Từ {new Date(med.startDate).toLocaleDateString('vi-VN')}
                                                {med.endDate && ` đến ${new Date(med.endDate).toLocaleDateString('vi-VN')}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex sm:flex-col items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedMedication(med);
                                            setShowReminderModal(true);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                                    >
                                        <Bell className="w-4 h-4" />
                                        <span className="hidden sm:inline">Thêm nhắc nhở</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMedication(med._id)}
                                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Reminders */}
                            {med.reminders && med.reminders.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Lịch nhắc uống thuốc:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {med.reminders.map((reminder) => (
                                            <div
                                                key={reminder._id}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100"
                                            >
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm font-semibold text-gray-900">{reminder.reminderTime}</span>
                                                <button
                                                    onClick={() => handleMarkTaken(reminder._id)}
                                                    className="ml-2 p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                    title="Đánh dấu đã uống"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                        <Pill className="w-10 h-10 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Tủ thuốc trống
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Thêm thuốc để quản lý và nhận lời nhắc uống thuốc đúng giờ
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm thuốc đầu tiên
                    </button>
                </div>
            )}

            {/* Add Medication Modal */}
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
                            <h3 className="text-xl font-bold text-gray-900">Thêm thuốc mới</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên thuốc *</label>
                                <input
                                    type="text"
                                    value={newMedication.name}
                                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="VD: Vitamin C 1000mg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Liều lượng</label>
                                    <input
                                        type="text"
                                        value={newMedication.dosage}
                                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="VD: 1 viên"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tần suất</label>
                                    <input
                                        type="text"
                                        value={newMedication.frequency}
                                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                        placeholder="VD: 2 lần/ngày"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Hướng dẫn sử dụng</label>
                                <input
                                    type="text"
                                    value={newMedication.instructions}
                                    onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="VD: Uống sau bữa ăn"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày bắt đầu *</label>
                                    <input
                                        type="date"
                                        value={newMedication.startDate}
                                        onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        value={newMedication.endDate}
                                        onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>
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
                                onClick={handleAddMedication}
                                disabled={!newMedication.name || !newMedication.startDate}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm thuốc
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Reminder Modal */}
            {showReminderModal && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
                    onClick={() => setShowReminderModal(false)}
                    style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'scaleIn 0.3s ease-out' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Thêm lời nhắc</h3>
                                <p className="text-gray-500 text-sm mt-1">cho {selectedMedication?.name}</p>
                            </div>
                            <button
                                onClick={() => setShowReminderModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ nhắc</label>
                                <input
                                    type="time"
                                    value={newReminder.reminderTime}
                                    onChange={(e) => setNewReminder({ ...newReminder, reminderTime: e.target.value })}
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-sm text-blue-700">
                                    💡 Nhắc nhở sẽ hiển thị vào giờ đã chọn hàng ngày trên trang Dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowReminderModal(false);
                                    setSelectedMedication(null);
                                }}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddReminder}
                                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all"
                            >
                                <Bell className="w-5 h-5" />
                                Thêm nhắc nhở
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
