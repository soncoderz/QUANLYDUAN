const { GoogleGenerativeAI } = require('@google/generative-ai');
const Appointment = require('../models/Appointment');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const PatientProfile = require('../models/PatientProfile');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
            .populate('doctorId', 'specialization')
            .sort({ appointmentDate: 1 })
            .limit(10);

        return appointments.map(apt => ({
            date: apt.appointmentDate.toLocaleDateString('vi-VN'),
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
            .select('name address phone specialties workingHours')
            .limit(20);

        return clinics.map(clinic => ({
            name: clinic.name,
            address: clinic.address,
            phone: clinic.phone,
            specialties: clinic.specialties || [],
            workingHours: clinic.workingHours || ''
        }));
    } catch (error) {
        console.error('Error getting clinics:', error);
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
                error: 'Vui lòng nhập tin nhắn'
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Gemini API chưa được cấu hình'
            });
        }

        // Get user's profile
        const profile = await PatientProfile.findOne({ userId });
        const userName = profile?.fullName || 'Bạn';

        // Get context data based on message content
        let contextData = '';
        const lowerMessage = message.toLowerCase();

        // Check if asking about appointments
        if (lowerMessage.includes('lịch') || lowerMessage.includes('hẹn') ||
            lowerMessage.includes('khám') || lowerMessage.includes('appointment')) {
            const appointments = await getUserAppointments(userId);
            if (appointments.length > 0) {
                contextData += `\n\nLỊCH KHÁM SẮP TỚI CỦA BỆNH NHÂN:\n`;
                appointments.forEach((apt, i) => {
                    contextData += `${i + 1}. Ngày ${apt.date} lúc ${apt.time} tại ${apt.clinic}`;
                    if (apt.address) contextData += ` (${apt.address})`;
                    contextData += ` - Trạng thái: ${apt.status}\n`;
                });
            } else {
                contextData += '\n\nBệnh nhân hiện không có lịch khám nào sắp tới.\n';
            }
        }

        // Check if asking about clinics
        if (lowerMessage.includes('phòng khám') || lowerMessage.includes('bệnh viện') ||
            lowerMessage.includes('clinic') || lowerMessage.includes('tìm')) {
            const clinics = await getClinics();
            if (clinics.length > 0) {
                contextData += `\n\nDANH SÁCH PHÒNG KHÁM:\n`;
                clinics.forEach((clinic, i) => {
                    contextData += `${i + 1}. ${clinic.name}`;
                    if (clinic.address) contextData += ` - Địa chỉ: ${clinic.address}`;
                    if (clinic.phone) contextData += ` - SĐT: ${clinic.phone}`;
                    if (clinic.specialties?.length) contextData += ` - Chuyên khoa: ${clinic.specialties.join(', ')}`;
                    contextData += '\n';
                });
            }
        }

        // Build system prompt
        const systemPrompt = `Bạn là trợ lý AI của hệ thống Healthcare Booking, một ứng dụng đặt lịch khám bệnh.
Tên bệnh nhân đang chat là: ${userName}

NHIỆM VỤ CỦA BẠN:
1. Tìm kiếm và trả lời về lịch khám của bệnh nhân
2. Tìm kiếm phòng khám, bệnh viện
3. Tư vấn sức khỏe cơ bản (LƯU Ý: luôn khuyên bệnh nhân đến gặp bác sĩ nếu triệu chứng nghiêm trọng)
4. Hướng dẫn sử dụng ứng dụng

QUY TẮC:
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Với câu hỏi y tế: chỉ tư vấn cơ bản, luôn khuyên gặp bác sĩ
- Không chẩn đoán bệnh, không kê đơn thuốc
- Trả lời ngắn gọn, súc tích
- Sử dụng emoji phù hợp để tạo cảm giác thân thiện
${contextData}`;

        // Initialize model - use gemini-pro (standard model)
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        // Build chat history
        const chatHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Start chat
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'Hãy nhớ vai trò của bạn.' }] },
                { role: 'model', parts: [{ text: `Xin chào ${userName}! 👋 Tôi là trợ lý AI của Healthcare Booking. Tôi có thể giúp bạn:\n\n📅 Xem lịch khám của bạn\n🏥 Tìm phòng khám\n💊 Tư vấn sức khỏe cơ bản\n\nBạn cần hỗ trợ gì?` }] },
                ...chatHistory
            ],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        // Send message with context
        const result = await chat.sendMessage(systemPrompt + '\n\nCâu hỏi của bệnh nhân: ' + message);
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
                error: 'Lỗi cấu hình API key. Vui lòng kiểm tra GEMINI_API_KEY.'
            });
        }

        if (error.message?.includes('model')) {
            return res.status(500).json({
                success: false,
                error: 'Lỗi model AI. Vui lòng thử lại.'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.'
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
            '📅 Lịch khám của tôi tuần này?',
            '🏥 Tìm phòng khám gần đây',
            '💊 Tôi bị đau đầu nên làm gì?',
            '🦷 Phòng khám nha khoa nào tốt?',
            '❓ Cách đặt lịch khám'
        ];

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Có lỗi xảy ra'
        });
    }
};

module.exports = {
    chat,
    getSuggestions
};
