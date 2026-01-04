const { GoogleGenerativeAI } = require('@google/generative-ai');
const Appointment = require('../models/Appointment');
const Clinic = require('../models/Clinic');
const PatientProfile = require('../models/PatientProfile');
const Medication = require('../models/Medication');
const MedicalRecord = require('../models/MedicalRecord');
const HealthMetric = require('../models/HealthMetric');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const normalizeText = (text = '') => text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * Get user's upcoming appointments for context
 */
const getUserAppointments = async (userId) => {
    try {
        const appointments = await Appointment.find({
            patientId: userId,
            appointmentDate: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .populate('clinicId', 'name address phone')
            .sort({ appointmentDate: 1 })
            .limit(10)
            .lean();

        return appointments.map(apt => ({
            date: apt.appointmentDate
                ? new Date(apt.appointmentDate).toLocaleDateString('vi-VN')
                : '',
            time: apt.timeSlot,
            clinic: apt.clinicId?.name || 'N/A',
            address: apt.clinicId?.address || '',
            status: apt.status,
            reason: apt.reason || '',
            type: apt.type
        }));
    } catch (error) {
        console.error('Error getting appointments:', error);
        return [];
    }
};

/**
 * Get clinics for context
 */
const getClinics = async () => {
    try {
        const clinics = await Clinic.find({ isActive: true })
            .select('name address phone specialty workingHours')
            .limit(20)
            .lean();

        return clinics.map(clinic => {
            const specialties = Array.isArray(clinic.specialty)
                ? clinic.specialty
                : clinic.specialty
                    ? [clinic.specialty]
                    : [];

            return {
                name: clinic.name,
                address: clinic.address,
                phone: clinic.phone,
                specialties,
                workingHours: clinic.workingHours || ''
            };
        });
    } catch (error) {
        console.error('Error getting clinics:', error);
        return [];
    }
};

/**
 * Get active medications for context
 */
const getActiveMedications = async (patientId) => {
    try {
        const meds = await Medication.find({
            patientId,
            isActive: true
        })
            .sort({ startDate: -1 })
            .limit(5)
            .populate('prescribedBy', 'fullName')
            .lean();

        return meds.map(med => ({
            name: med.name,
            dosage: med.dosage || '',
            frequency: med.frequency || '',
            instructions: med.instructions || '',
            doctor: med.prescribedBy?.fullName || '',
            endDate: med.endDate ? new Date(med.endDate).toLocaleDateString('vi-VN') : ''
        }));
    } catch (error) {
        console.error('Error getting medications:', error);
        return [];
    }
};

/**
 * Get latest health metrics for context
 */
const getLatestHealthMetrics = async (patientId) => {
    try {
        const metrics = await HealthMetric.find({ patientId })
            .sort({ measuredAt: -1 })
            .limit(30)
            .lean();

        const latestByType = {};
        metrics.forEach(metric => {
            if (!latestByType[metric.metricType]) {
                latestByType[metric.metricType] = {
                    type: metric.metricType,
                    value: metric.value,
                    secondaryValue: metric.secondaryValue,
                    unit: metric.unit,
                    measuredAt: metric.measuredAt
                        ? new Date(metric.measuredAt).toLocaleString('vi-VN')
                        : ''
                };
            }
        });

        return Object.values(latestByType);
    } catch (error) {
        console.error('Error getting health metrics:', error);
        return [];
    }
};

/**
 * Get recent medical records for context
 */
const getRecentMedicalRecords = async (patientId) => {
    try {
        const records = await MedicalRecord.find({ patientId })
            .sort({ recordDate: -1 })
            .limit(3)
            .populate('doctorId', 'fullName specialty')
            .lean();

        return records.map(record => ({
            diagnosis: record.diagnosis,
            treatment: record.treatment || '',
            symptoms: record.symptoms || '',
            doctor: record.doctorId?.fullName || '',
            specialty: record.doctorId?.specialty || '',
            prescriptions: Array.isArray(record.prescriptions)
                ? record.prescriptions.map(p => p.name).filter(Boolean).slice(0, 3)
                : [],
            recordDate: (record.recordDate || record.createdAt)
                ? new Date(record.recordDate || record.createdAt).toLocaleDateString('vi-VN')
                : ''
        }));
    } catch (error) {
        console.error('Error getting medical records:', error);
        return [];
    }
};

/**
 * @desc    Chat with AI assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
const chat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Vui long nhap noi dung tro chuyen'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API chua duoc cau hinh'
            });
        }

        // Get user's profile
        const profile = await PatientProfile.findOne({ userId }).lean();
        const userName = profile?.fullName || 'Ban';

        // Decide which data the user is asking for
        const normalizedMessage = normalizeText(message);
        const wantsAppointments = normalizedMessage.includes('lich') ||
            normalizedMessage.includes('hen') ||
            normalizedMessage.includes('kham') ||
            normalizedMessage.includes('appointment');
        const wantsClinics = normalizedMessage.includes('phong kham') ||
            normalizedMessage.includes('benh vien') ||
            normalizedMessage.includes('clinic') ||
            normalizedMessage.includes('tim dia chi');
        const wantsMedications = normalizedMessage.includes('thuoc') ||
            normalizedMessage.includes('don thuoc') ||
            normalizedMessage.includes('uong') ||
            normalizedMessage.includes('medication') ||
            normalizedMessage.includes('nhac thuoc');
        const wantsMetrics = normalizedMessage.includes('chi so') ||
            normalizedMessage.includes('huyet ap') ||
            normalizedMessage.includes('nhip tim') ||
            normalizedMessage.includes('can nang') ||
            normalizedMessage.includes('duong huyet') ||
            normalizedMessage.includes('health') ||
            normalizedMessage.includes('spo2') ||
            normalizedMessage.includes('than nhiet');
        const wantsRecords = normalizedMessage.includes('ho so') ||
            normalizedMessage.includes('ket qua') ||
            normalizedMessage.includes('chan doan') ||
            normalizedMessage.includes('record') ||
            normalizedMessage.includes('kham truoc') ||
            normalizedMessage.includes('tai kham');

        const [
            appointments,
            clinics,
            medications,
            healthMetrics,
            medicalRecords
        ] = await Promise.all([
            wantsAppointments ? getUserAppointments(userId) : [],
            wantsClinics ? getClinics() : [],
            wantsMedications ? getActiveMedications(userId) : [],
            wantsMetrics ? getLatestHealthMetrics(userId) : [],
            wantsRecords ? getRecentMedicalRecords(userId) : []
        ]);

        const contextSections = [];

        if (profile) {
            contextSections.push(
                `HO SO BENH NHAN:\n- Ho ten: ${profile.fullName}\n- Gioi tinh: ${profile.gender || 'Chua cap nhat'}\n- Dia chi: ${profile.address || 'Chua cap nhat'}`
            );
        }

        if (wantsAppointments) {
            if (appointments.length > 0) {
                const appointmentLines = appointments.map((apt, i) => {
                    const address = apt.address ? ` (${apt.address})` : '';
                    const reason = apt.reason ? ` - Ly do: ${apt.reason}` : '';
                    return `${i + 1}. Ngay ${apt.date} luc ${apt.time} tai ${apt.clinic}${address} - Trang thai: ${apt.status}${reason}`;
                });
                contextSections.push(`LICH KHAM SAP TOI:\n${appointmentLines.join('\n')}`);
            } else {
                contextSections.push('Benh nhan hien khong co lich kham sap toi.');
            }
        }

        if (wantsClinics && clinics.length > 0) {
            const clinicLines = clinics.map((clinic, i) => {
                const address = clinic.address ? ` - Dia chi: ${clinic.address}` : '';
                const phone = clinic.phone ? ` - SDT: ${clinic.phone}` : '';
                const specialties = clinic.specialties?.length
                    ? ` - Chuyen khoa: ${clinic.specialties.join(', ')}`
                    : '';
                return `${i + 1}. ${clinic.name}${address}${phone}${specialties}`;
            });
            contextSections.push(`DANH SACH PHONG KHAM:\n${clinicLines.join('\n')}`);
        }

        if (wantsMedications) {
            if (medications.length > 0) {
                const medicationLines = medications.map((med, i) => {
                    const dosage = med.dosage ? ` - Lieu luong: ${med.dosage}` : '';
                    const frequency = med.frequency ? ` - Tan suat: ${med.frequency}` : '';
                    const instructions = med.instructions ? ` - Huong dan: ${med.instructions}` : '';
                    const endDate = med.endDate ? ` - Den: ${med.endDate}` : '';
                    const doctor = med.doctor ? ` - Bac si: ${med.doctor}` : '';
                    return `${i + 1}. ${med.name}${dosage}${frequency}${instructions}${doctor}${endDate}`;
                });
                contextSections.push(`THUOC DANG SU DUNG:\n${medicationLines.join('\n')}`);
            } else {
                contextSections.push('Khong tim thay thuoc dang su dung nao.');
            }
        }

        if (wantsMetrics && healthMetrics.length > 0) {
            const metricLines = healthMetrics.map(metric => {
                const value = metric.secondaryValue
                    ? `${metric.value}/${metric.secondaryValue} ${metric.unit}`
                    : `${metric.value} ${metric.unit}`;
                const time = metric.measuredAt ? ` - Thoi gian: ${metric.measuredAt}` : '';
                return `- ${metric.type}: ${value}${time}`;
            });
            contextSections.push(`CHI SO SUC KHOE GAN NHAT:\n${metricLines.join('\n')}`);
        }

        if (wantsRecords) {
            if (medicalRecords.length > 0) {
                const recordLines = medicalRecords.map((record, i) => {
                    const treatment = record.treatment ? ` - Huong dan: ${record.treatment}` : '';
                    const doctor = record.doctor ? ` - Bac si: ${record.doctor}` : '';
                    const specialty = record.specialty ? ` (${record.specialty})` : '';
                    const prescriptions = record.prescriptions?.length
                        ? ` - Thuoc: ${record.prescriptions.join(', ')}`
                        : '';
                    const date = record.recordDate ? ` - Ngay: ${record.recordDate}` : '';
                    const symptoms = record.symptoms ? ` - Trieu chung: ${record.symptoms}` : '';
                    return `${i + 1}. Chan doan: ${record.diagnosis}${doctor}${specialty}${date}${symptoms}${treatment}${prescriptions}`;
                });
                contextSections.push(`HO SO BENH AN GAN NHAT:\n${recordLines.join('\n')}`);
            } else {
                contextSections.push('Khong tim thay ho so benh an gan day.');
            }
        }

        if (contextSections.length === 0) {
            contextSections.push('Khong co du lieu lien quan trong he thong. Hay dat cau hoi ro rang hon.');
        }

        // Build system prompt
        const systemPrompt = `Ban la tro ly AI cua he thong Healthcare Booking, chi tra loi bang du lieu co trong he thong.
Nguoi dung dang chat: ${userName}

NGUYEN TAC BAT BUOC:
- Chi su dung thong tin trong cac phan ngu canh ben duoi, khong tu them kien thuc ben ngoai.
- Neu khong tim thay du lieu phu hop, thong bao ro rang (VD: "Hien khong co du lieu ...") va goi y buoc tiep theo.
- Tra loi bang tieng Viet, than thien, ngan gon; khong chan doan benh va khong ke don thuoc.
- Khuyen khich nguoi dung lien he bac si khi co trieu chung bat thuong.

DU LIEU HE THONG:
${contextSections.join('\n\n')}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        // Build chat history
        const chatHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Start chat
        const chatSession = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'Ban la tro ly AI ho tro benh nhan bang du lieu he thong.' }] },
                { role: 'model', parts: [{ text: `Xin chao ${userName}! Toi se tra loi du tren du lieu co san va luon de xuat lien he bac si khi can.` }] },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        // Send message with context
        const result = await chatSession.sendMessage(`${systemPrompt}\n\nCau hoi cua nguoi dung: ${message}`);
        const response = result.response.text();

        res.json({
            success: true,
            data: {
                message: response,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('AI Chat error:', error.message);
        console.error('Full error:', error);

        // Handle specific Gemini errors
        if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
            return res.status(500).json({
                success: false,
                error: 'Loi cau hinh API key. Vui long kiem tra GEMINI_API_KEY.'
            });
        }

        if (error.message?.includes('model')) {
            return res.status(500).json({
                success: false,
                error: 'Loi model AI. Vui long thu lai.'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Xin loi, tro ly AI dang gap su co. Vui long thu lai sau.'
        });
    }
};

/**
 * @desc    Get quick suggestions
 * @route   GET /api/ai/suggestions
 * @access  Private
 */
const getSuggestions = async (req, res) => {
    try {
        const suggestions = [
            'Toi co lich kham nao trong tuan nay?',
            'Thuoc toi dang duoc chi dinh la gi?',
            'Cho toi biet chi so huyet ap gan nhat',
            'Tim phong kham gan nhat phu hop chuyen khoa',
            'Toi can xem lai chan doan lan kham truoc'
        ];

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Co loi xay ra'
        });
    }
};

module.exports = {
    chat,
    getSuggestions
};
