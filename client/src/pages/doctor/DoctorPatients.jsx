import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Users,
    Search,
    User,
    Calendar,
    Phone,
    Mail,
    ChevronRight,
    Heart,
    FileText
} from 'lucide-react';

export default function DoctorPatients() {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, [search]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await api.get(`/doctors/my-patients?${params}`);
            if (response.data.success) {
                setPatients(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientDetails = async (patientId) => {
        try {
            setLoadingDetails(true);
            const response = await api.get(`/doctors/patients/${patientId}`);
            if (response.data.success) {
                setPatientDetails(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching patient details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        fetchPatientDetails(patient.userId._id);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Bệnh nhân của tôi</h1>
                <p className="text-slate-400 mt-1">Danh sách bệnh nhân đã có lịch hẹn với bạn</p>
            </div>

            {/* Search */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bệnh nhân theo tên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Patients List */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50">
                        <h2 className="font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-teal-400" />
                            Danh sách bệnh nhân ({patients.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : patients.length === 0 ? (
                        <div className="py-20 text-center">
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Chưa có bệnh nhân nào</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50 max-h-[600px] overflow-y-auto">
                            {patients.map((patient) => (
                                <div
                                    key={patient._id}
                                    onClick={() => handlePatientClick(patient)}
                                    className={`p-4 cursor-pointer transition-colors ${selectedPatient?._id === patient._id
                                        ? 'bg-teal-500/10 border-l-2 border-l-teal-500'
                                        : 'hover:bg-slate-700/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {patient.avatar ? (
                                            <img src={patient.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center border border-teal-500/30">
                                                <User className="w-5 h-5 text-teal-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{patient.fullName}</p>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                                                <span>{patient.appointmentCount} lần khám</span>
                                                {patient.lastAppointment && (
                                                    <span>• Gần nhất: {formatDate(patient.lastAppointment)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Patient Details */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                    {!selectedPatient ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="text-center">
                                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">Chọn bệnh nhân để xem chi tiết</p>
                            </div>
                        </div>
                    ) : loadingDetails ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : patientDetails ? (
                        <div className="h-full max-h-[600px] overflow-y-auto">
                            {/* Patient Header */}
                            <div className="p-5 border-b border-slate-700/50 bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
                                <div className="flex items-center gap-4">
                                    {patientDetails.patient.avatar ? (
                                        <img src={patientDetails.patient.avatar} alt="" className="w-16 h-16 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white">
                                            {patientDetails.patient.fullName?.charAt(0)?.toUpperCase() || 'P'}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{patientDetails.patient.fullName}</h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-400">
                                            {patientDetails.patient.userId?.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {patientDetails.patient.userId.phone}
                                                </span>
                                            )}
                                            {patientDetails.patient.userId?.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {patientDetails.patient.userId.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-700/30 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">Ngày sinh</p>
                                        <p className="text-white font-medium">{formatDate(patientDetails.patient.dateOfBirth)}</p>
                                    </div>
                                    <div className="p-3 bg-slate-700/30 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">Giới tính</p>
                                        <p className="text-white font-medium">
                                            {patientDetails.patient.gender === 'male' ? 'Nam' :
                                                patientDetails.patient.gender === 'female' ? 'Nữ' : 'Khác'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-700/30 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">Nhóm máu</p>
                                        <p className="text-white font-medium">{patientDetails.patient.bloodType || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-700/30 rounded-xl">
                                        <p className="text-xs text-slate-400 mb-1">Dị ứng</p>
                                        <p className="text-white font-medium text-sm">
                                            {patientDetails.patient.allergies?.length > 0
                                                ? patientDetails.patient.allergies.join(', ')
                                                : 'Không có'}
                                        </p>
                                    </div>
                                </div>

                                {/* Recent Appointments */}
                                <div>
                                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-teal-400" />
                                        Lịch sử khám ({patientDetails.appointments?.length || 0})
                                    </h4>
                                    <div className="space-y-2">
                                        {patientDetails.appointments?.slice(0, 5).map((apt) => (
                                            <div key={apt._id} className="p-3 bg-slate-700/30 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white">{formatDate(apt.appointmentDate)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${apt.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {apt.status === 'completed' ? 'Hoàn thành' : apt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Medical Records */}
                                {patientDetails.medicalRecords?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-teal-400" />
                                            Hồ sơ y tế ({patientDetails.medicalRecords.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {patientDetails.medicalRecords.slice(0, 3).map((record) => (
                                                <div key={record._id} className="p-3 bg-slate-700/30 rounded-xl">
                                                    <p className="text-white font-medium">{record.diagnosis || 'Khám tổng quát'}</p>
                                                    <p className="text-sm text-slate-400 mt-1">{formatDate(record.visitDate)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
