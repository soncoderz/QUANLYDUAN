import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clinicService, doctorService, appointmentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Clock,
    User,
    MapPin,
    Check,
    Stethoscope,
    ChevronLeft,
    ChevronRight,
    Phone,
    CreditCard,
    CheckCircle
} from 'lucide-react';

export default function Booking() {
    const { clinicId } = useParams();
    const navigate = useNavigate();
    const { success, error: showError, info } = useToast();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [clinic, setClinic] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [reason, setReason] = useState('');
    const [appointmentType, setAppointmentType] = useState('consultation');

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const appointmentTypes = [
        { value: 'consultation', label: 'Tư vấn', desc: 'Khám và tư vấn bệnh' },
        { value: 'checkup', label: 'Khám tổng quát', desc: 'Kiểm tra sức khỏe định kỳ' },
        { value: 'follow-up', label: 'Tái khám', desc: 'Khám lại theo lịch hẹn' },
    ];

    useEffect(() => {
        fetchClinicData();
    }, [clinicId]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const fetchClinicData = async () => {
        try {
            const [clinicRes, doctorsRes] = await Promise.all([
                clinicService.getClinicById(clinicId),
                doctorService.getDoctors({ clinicId }),
            ]);

            if (clinicRes.success) setClinic(clinicRes.data);
            if (doctorsRes.success) setDoctors(doctorsRes.data);
        } catch (error) {
            showError('Không thể tải thông tin phòng khám');
            navigate('/clinics');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            const response = await clinicService.getAvailableSlots(
                clinicId,
                selectedDate,
                selectedDoctor._id
            );
            if (response.success) {
                const slotsByDoctor = response.data?.availableSlots || [];
                const matchedDoctor = slotsByDoctor.find(
                    (d) => d.doctor?.id === selectedDoctor._id
                ) || slotsByDoctor[0];

                const slots = matchedDoctor?.slots
                    ?.filter((s) => s.available)
                    ?.map((s) => s.time) || [];
                setAvailableSlots(slots);
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
            showError('Khong the tai khung gio kham, vui long thu lai');
        }
    };

    const handleDoctorSelect = (doctor) => {
        setSelectedDoctor(doctor);
        setSelectedSlot('');
        setSelectedDate('');
        setAvailableSlots([]);
        info(`Đã chọn ${doctor.fullName}`);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot('');
        setAvailableSlots([]);
    };

    const handleSubmit = async () => {
        if (!selectedDoctor) {
            showError('Vui long chon bac si truoc khi dat lich');
            return;
        }
        if (!selectedDate || !selectedSlot) {
            showError('Vui long chon ngay va khung gio kham');
            return;
        }

        setSubmitting(true);
        try {
            const response = await appointmentService.createAppointment({
                clinicId,
                doctorId: selectedDoctor._id,
                appointmentDate: selectedDate,
                timeSlot: selectedSlot,
                type: appointmentType,
                reason,
            });

            if (response.success) {
                success('Đặt lịch khám thành công!', 'Chúc mừng');
                navigate('/appointments');
            }
        } catch (error) {
            showError(error.response?.data?.error || 'Không thể đặt lịch. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();

        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allowedDays = (selectedDoctor?.workingDays || [1, 2, 3, 4, 5]).map((d) => Number(d));

        // Previous month days
        for (let i = 0; i < startDay; i++) {
            days.push({ date: null, disabled: true });
        }

        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toLocaleDateString('en-CA'); // Keep local date to avoid timezone shifting
            const isPast = date < today;
            const isAllowedDay = allowedDays.includes(date.getDay());

            days.push({
                date: dateStr,
                day: i,
                disabled: isPast || !isAllowedDay,
                isToday: date.getTime() === today.getTime(),
                isSelected: dateStr === selectedDate,
            });
        }

        return days;
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
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
        <div className="max-w-4xl mx-auto" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate('/clinics')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {step > 1 ? 'Quay lại' : 'Danh sách phòng khám'}
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Đặt lịch khám</h1>
                <p className="text-gray-500 mt-1">{clinic?.name}</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                    </div>

                    {[
                        { num: 1, label: 'Chọn bác sĩ' },
                        { num: 2, label: 'Chọn thời gian' },
                        { num: 3, label: 'Xác nhận' },
                    ].map((s) => (
                        <div key={s.num} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s.num
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200'
                                : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                            </div>
                            <span className={`mt-2 text-xs sm:text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 1: Select Doctor */}
            {step === 1 && (
                <div className="space-y-4" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn bác sĩ</h2>

                    {doctors.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {doctors.map((doctor) => (
                                <div
                                    key={doctor._id}
                                    onClick={() => handleDoctorSelect(doctor)}
                                    className={`bg-white rounded-2xl shadow-lg p-5 cursor-pointer transition-all hover:shadow-xl ${selectedDoctor?._id === doctor._id
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-2xl shadow-lg shadow-blue-200 overflow-hidden ${doctor.avatar ? 'bg-white border border-blue-100' : 'bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'}`}>
                                            {doctor.avatar ? (
                                                <img src={doctor.avatar} alt={doctor.fullName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Stethoscope className="w-7 h-7 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900">{doctor.fullName}</h3>
                                            <p className="text-sm text-gray-500">{doctor.specialty}</p>
                                            <p className="text-sm text-gray-500 mt-1">{doctor.experience} năm kinh nghiệm</p>
                                            <p className="text-sm font-semibold text-blue-600 mt-2">
                                                {doctor.consultationFee?.toLocaleString()}đ
                                            </p>
                                        </div>
                                        {selectedDoctor?._id === doctor._id && (
                                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <p className="text-gray-500">Không có bác sĩ nào khả dụng</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedDoctor}
                            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Tiếp tục
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
                <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                    <h2 className="text-lg font-semibold text-gray-900">Chọn ngày và giờ khám</h2>

                    {/* Calendar */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={prevMonth}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button
                                onClick={nextMonth}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays().map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => day.date && !day.disabled && handleDateSelect(day.date)}
                                    disabled={!day.date || day.disabled}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${day.isSelected
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-lg'
                                        : day.isToday
                                            ? 'bg-blue-100 text-blue-600'
                                            : day.disabled
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {day.day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                        <div className="bg-white rounded-2xl shadow-lg p-6" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 className="font-semibold text-gray-900 mb-4">
                                Khung giờ khả dụng - {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h3>

                            {availableSlots.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${selectedSlot === slot
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    Không có khung giờ khả dụng cho ngày này
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={!selectedDate || !selectedSlot}
                            className="flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Tiếp tục
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
                <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                    <h2 className="text-lg font-semibold text-gray-900">Xác nhận thông tin</h2>

                    {/* Appointment Summary */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-blue-100 flex items-center justify-center shadow-lg shadow-blue-200">
                                {selectedDoctor?.avatar ? (
                                    <img src={selectedDoctor.avatar} alt={selectedDoctor.fullName} className="w-full h-full object-cover" />
                                ) : clinic?.image ? (
                                    <img src={clinic.image} alt={clinic.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Stethoscope className="w-8 h-8 text-blue-500" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedDoctor?.fullName}</h3>
                                <p className="text-gray-500">{selectedDoctor?.specialty}</p>
                                <p className="text-sm text-gray-400 line-clamp-1 mt-1">{clinic?.name}</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Ngày khám</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(selectedDate).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Giờ khám</p>
                                    <p className="font-semibold text-gray-900">{selectedSlot}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Địa điểm</p>
                                    <p className="font-semibold text-gray-900 line-clamp-1">{clinic?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <CreditCard className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Phí khám</p>
                                    <p className="font-semibold text-blue-600">{selectedDoctor?.consultationFee?.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Type */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Loại khám</h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {appointmentTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setAppointmentType(type.value)}
                                    className={`p-4 rounded-xl text-left transition-all ${appointmentType === type.value
                                        ? 'bg-blue-50 border-2 border-blue-500'
                                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                        }`}
                                >
                                    <p className="font-semibold text-gray-900">{type.label}</p>
                                    <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Lý do khám (tùy chọn)</h3>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Mô tả triệu chứng hoặc lý do bạn muốn khám..."
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 min-h-[100px] resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(2)}
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Xác nhận đặt lịch
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
