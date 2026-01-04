const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send password reset email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise} - SendGrid response
 */
const sendPasswordResetEmail = async (to, resetToken) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@healthcare.com';

    const msg = {
        to,
        from: fromEmail,
        subject: 'Đặt lại mật khẩu - Healthcare Booking',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Đặt lại mật khẩu</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); border-radius: 16px 16px 0 0;">
                                        <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 32px;">💙</span>
                                        </div>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Healthcare Booking</h1>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 22px; font-weight: 600;">Đặt lại mật khẩu</h2>
                                        <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                                            Click vào nút bên dưới để tiếp tục:
                                        </p>
                                        
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="${resetUrl}" 
                                                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                                                        Đặt lại mật khẩu
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 24px 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                                            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                                            Link sẽ hết hạn sau <strong>5 phút</strong>.
                                        </p>
                                        
                                        <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                                            <p style="margin: 0; color: #475569; font-size: 13px;">
                                                <strong>Không thể click vào nút?</strong><br>
                                                Copy và dán link sau vào trình duyệt:<br>
                                                <a href="${resetUrl}" style="color: #0ea5e9; word-break: break-all;">${resetUrl}</a>
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                            © 2026 Healthcare Booking. All rights reserved.<br>
                                            Email này được gửi tự động, vui lòng không trả lời.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `Đặt lại mật khẩu - Healthcare Booking\n\nChúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\nVui lòng truy cập link sau để đặt lại mật khẩu:\n${resetUrl}\n\nLink sẽ hết hạn sau 5 phút.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`
    };

    try {
        const response = await sgMail.send(msg);
        console.log('Password reset email sent to:', to);
        return response;
    } catch (error) {
        console.error('SendGrid email error:', error);
        if (error.response) {
            console.error('SendGrid response body:', error.response.body);
        }
    }
};

/**
 * Send appointment reminder email using SendGrid
 * @param {string} to - Recipient email address
 * @param {Object} appointment - Appointment details
 * @param {string} appointment.patientName - Patient's name
 * @param {string} appointment.doctorName - Doctor's name
 * @param {string} appointment.clinicName - Clinic name
 * @param {string} appointment.clinicAddress - Clinic address
 * @param {Date} appointment.appointmentDate - Appointment date
 * @param {string} appointment.timeSlot - Time slot
 * @returns {Promise} - SendGrid response
 */
const sendAppointmentReminderEmail = async (to, appointment) => {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@healthcare.com';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const msg = {
        to,
        from: fromEmail,
        subject: `🔔 Nhắc nhở: Lịch khám ngày ${formattedDate} - Healthcare Booking`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Nhắc nhở lịch khám</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0;">
                                        <div style="width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 32px;">🔔</span>
                                        </div>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Nhắc nhở lịch khám</h1>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 40px;">
                                        <p style="margin: 0 0 24px; color: #64748b; font-size: 16px; line-height: 1.6;">
                                            Xin chào <strong>${appointment.patientName}</strong>,<br><br>
                                            Đây là email nhắc nhở lịch khám của bạn vào <strong>ngày mai</strong>:
                                        </p>
                                        
                                        <!-- Appointment Details Card -->
                                        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #86efac;">
                                            <table style="width: 100%;">
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #64748b; font-size: 14px;">📅 Ngày khám:</span><br>
                                                        <strong style="color: #1e293b; font-size: 16px;">${formattedDate}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #64748b; font-size: 14px;">⏰ Giờ khám:</span><br>
                                                        <strong style="color: #1e293b; font-size: 16px;">${appointment.timeSlot}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #64748b; font-size: 14px;">👨‍⚕️ Bác sĩ:</span><br>
                                                        <strong style="color: #1e293b; font-size: 16px;">${appointment.doctorName}</strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #64748b; font-size: 14px;">🏥 Phòng khám:</span><br>
                                                        <strong style="color: #1e293b; font-size: 16px;">${appointment.clinicName}</strong>
                                                    </td>
                                                </tr>
                                                ${appointment.clinicAddress ? `
                                                <tr>
                                                    <td style="padding: 8px 0;">
                                                        <span style="color: #64748b; font-size: 14px;">📍 Địa chỉ:</span><br>
                                                        <strong style="color: #1e293b; font-size: 14px;">${appointment.clinicAddress}</strong>
                                                    </td>
                                                </tr>
                                                ` : ''}
                                            </table>
                                        </div>
                                        
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="${clientUrl}/appointments" 
                                                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                                                        Xem chi tiết lịch hẹn
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Tips -->
                                        <div style="margin-top: 24px; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                            <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">💡 Lưu ý:</p>
                                            <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px; line-height: 1.6;">
                                                <li>Vui lòng đến trước giờ hẹn 15 phút</li>
                                                <li>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</li>
                                                <li>Chuẩn bị sẵn các kết quả xét nghiệm trước đó</li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 16px 16px;">
                                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                            © 2026 Healthcare Booking. All rights reserved.<br>
                                            Email này được gửi tự động, vui lòng không trả lời.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `Nhắc nhở lịch khám - Healthcare Booking\n\nXin chào ${appointment.patientName},\n\nĐây là email nhắc nhở lịch khám của bạn vào ngày mai:\n\n📅 Ngày khám: ${formattedDate}\n⏰ Giờ khám: ${appointment.timeSlot}\n👨‍⚕️ Bác sĩ: ${appointment.doctorName}\n🏥 Phòng khám: ${appointment.clinicName}\n${appointment.clinicAddress ? `📍 Địa chỉ: ${appointment.clinicAddress}\n` : ''}\n\nLưu ý:\n- Vui lòng đến trước giờ hẹn 15 phút\n- Mang theo CMND/CCCD và thẻ BHYT (nếu có)\n- Chuẩn bị sẵn các kết quả xét nghiệm trước đó\n\nTrân trọng,\nHealthcare Booking`
    };

    try {
        const response = await sgMail.send(msg);
        console.log('Appointment reminder email sent to:', to);
        return response;
    } catch (error) {
        console.error('SendGrid appointment reminder email error:', error);
        if (error.response) {
            console.error('SendGrid response body:', error.response.body);
        }
        throw error;
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendAppointmentReminderEmail
};
