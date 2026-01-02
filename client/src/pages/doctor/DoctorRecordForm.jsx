import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    User,
    Calendar,
    Pill,
    Heart,
    Activity,
    Thermometer,
    Scale
} from 'lucide-react';

// Pre-defined options for comboboxes
const DOSAGE_OPTIONS = ['1 vien', '2 vien', '3 vien', '5ml', '10ml', '15ml', '1 goi', '2 goi'];
const FREQUENCY_OPTIONS = ['1 lan/ngay', '2 lan/ngay', '3 lan/ngay', '4 lan/ngay', 'Khi can'];
const DURATION_OPTIONS = ['3 ngay', '5 ngay', '7 ngay', '10 ngay', '14 ngay', '30 ngay'];
const INSTRUCTION_OPTIONS = ['Uong sau an', 'Uong truoc an', 'Uong sang', 'Uong toi', 'Truoc khi ngu'];

export default function DoctorRecordForm() {
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [appointment, setAppointment] = useState(null);

    const [formData, setFormData] = useState({
        diagnosis: '',
        symptoms: '',
        treatment: '',
        doctorNotes: '',
        vitalSigns: {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            weight: ''
        },
        prescriptions: []
    });

    useEffect(() => {
        if (appointmentId) {
            fetchAppointmentDetails();
        } else {
            setLoading(false);
        }
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            const response = await api.get(`/doctors/my-appointments`);
            if (response.data.success) {
                const apt = response.data.data.find(a => a._id === appointmentId);
                if (apt) {
                    setAppointment(apt);
                }
            }
        } catch (error) {
            console.error('Error fetching appointment:', error);
        } finally {
            setLoading(false);
        }
    };

    const addPrescription = () => {
        setFormData({
            ...formData,
            prescriptions: [
                ...formData.prescriptions,
                { name: '', dosage: '1 vien', frequency: '1 lan/ngay', duration: '7 ngay', instructions: 'Uong sau an' }
            ]
        });
    };

    const removePrescription = (index) => {
        setFormData({
            ...formData,
            prescriptions: formData.prescriptions.filter((_, i) => i !== index)
        });
    };

    const updatePrescription = (index, field, value) => {
        const updated = [...formData.prescriptions];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, prescriptions: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.diagnosis.trim()) {
            showError('Vui long nhap chan doan');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                patientId: appointment?.patientId?._id || searchParams.get('patientId'),
                appointmentId: appointmentId || null,
                diagnosis: formData.diagnosis,
                symptoms: formData.symptoms,
                treatment: formData.treatment,
                doctorNotes: formData.doctorNotes,
                vitalSigns: formData.vitalSigns,
                prescriptions: formData.prescriptions.filter(p => p.name.trim())
            };

            const response = await api.post('/doctors/records', payload);
            if (response.data.success) {
                success('Tao ho so benh an thanh cong');
                navigate('/doctor/appointments');
            }
        } catch (error) {
            showError('Khong the tao ho so benh an');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Tao ho so benh an</h1>
                    <p className="text-slate-400 mt-1">Nhap thong tin kham va ke don thuoc</p>
                </div>
            </div>

            {/* Patient Info */}
            {appointment && (
                <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-2xl p-5 border border-teal-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                            {appointment.patientProfile?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div>
                            <p className="font-semibold text-white text-lg">{appointment.patientProfile?.fullName || 'Benh nhan'}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                                </span>
                                <span>{appointment.timeSlot}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Diagnosis & Symptoms */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-teal-400" />
                        Thong tin kham benh
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Chan doan <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                placeholder="Nhap chan doan..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Trieu chung</label>
                            <textarea
                                value={formData.symptoms}
                                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                placeholder="Mo ta trieu chung..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Phuong phap dieu tri</label>
                            <textarea
                                value={formData.treatment}
                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                placeholder="Mo ta phuong phap dieu tri..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Ghi chu bac si</label>
                            <textarea
                                value={formData.doctorNotes}
                                onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                placeholder="Ghi chu them..."
                            />
                        </div>
                    </div>
                </div>

                {/* Vital Signs */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Chi so suc khoe
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Heart className="w-4 h-4 text-rose-400" />
                                Huyet ap
                            </label>
                            <input
                                type="text"
                                value={formData.vitalSigns.bloodPressure}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vitalSigns: { ...formData.vitalSigns, bloodPressure: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                placeholder="120/80"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Activity className="w-4 h-4 text-amber-400" />
                                Nhip tim
                            </label>
                            <input
                                type="number"
                                value={formData.vitalSigns.heartRate}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vitalSigns: { ...formData.vitalSigns, heartRate: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                placeholder="bpm"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Thermometer className="w-4 h-4 text-orange-400" />
                                Nhiet do
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.vitalSigns.temperature}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vitalSigns: { ...formData.vitalSigns, temperature: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                placeholder="*C"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                <Scale className="w-4 h-4 text-blue-400" />
                                Can nang
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.vitalSigns.weight}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    vitalSigns: { ...formData.vitalSigns, weight: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                placeholder="kg"
                            />
                        </div>
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Pill className="w-5 h-5 text-purple-400" />
                            Don thuoc ({formData.prescriptions.length})
                        </h2>
                        <button
                            type="button"
                            onClick={addPrescription}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Them thuoc
                        </button>
                    </div>

                    {formData.prescriptions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Chua co thuoc nao trong don</p>
                            <p className="text-sm">Nhan "Them thuoc" de ke don</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.prescriptions.map((med, index) => (
                                <div key={index} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Ten thuoc <span className="text-rose-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={med.name}
                                                onChange={(e) => updatePrescription(index, 'name', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                                placeholder="Nhap ten thuoc..."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePrescription(index)}
                                            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors mt-6"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Lieu luong</label>
                                            <select
                                                value={med.dosage}
                                                onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                            >
                                                {DOSAGE_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Tan suat</label>
                                            <select
                                                value={med.frequency}
                                                onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                            >
                                                {FREQUENCY_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">So ngay uong</label>
                                            <select
                                                value={med.duration}
                                                onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                            >
                                                {DURATION_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Huong dan</label>
                                            <select
                                                value={med.instructions}
                                                onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
                                            >
                                                {INSTRUCTION_OPTIONS.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all disabled:opacity-60"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Luu ho so benh an
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
