const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const { sendAppointmentReminderEmail } = require('../utils/emailService');

/**
 * Send appointment reminder emails for appointments scheduled for tomorrow
 * Runs daily at 8:00 AM
 */
const sendAppointmentReminders = async () => {
    console.log('📧 Running appointment reminder cron job...');

    try {
        // Get tomorrow's date range (start and end of day)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        // Find all scheduled/confirmed appointments for tomorrow
        const appointments = await Appointment.find({
            appointmentDate: {
                $gte: tomorrow,
                $lte: tomorrowEnd
            },
            status: { $in: ['scheduled', 'confirmed'] }
        })
            .populate('patientId', 'email')
            .populate('doctorId', 'userId specialization')
            .populate('clinicId', 'name address');

        console.log(`Found ${appointments.length} appointments for tomorrow`);

        let successCount = 0;
        let failCount = 0;

        for (const appointment of appointments) {
            try {
                // Get patient profile for name
                const patientProfile = await PatientProfile.findOne({
                    userId: appointment.patientId._id
                });

                // Get doctor details
                const doctor = await Doctor.findById(appointment.doctorId._id)
                    .populate('userId', 'email');

                const doctorProfile = await PatientProfile.findOne({
                    userId: doctor?.userId?._id
                });

                const patientEmail = appointment.patientId?.email;
                if (!patientEmail) {
                    console.log(`No email found for patient in appointment ${appointment._id}`);
                    failCount++;
                    continue;
                }

                const appointmentDetails = {
                    patientName: patientProfile?.fullName || 'Bệnh nhân',
                    doctorName: doctorProfile?.fullName || 'Bác sĩ',
                    clinicName: appointment.clinicId?.name || 'Phòng khám',
                    clinicAddress: appointment.clinicId?.address || '',
                    appointmentDate: appointment.appointmentDate,
                    timeSlot: appointment.timeSlot
                };

                await sendAppointmentReminderEmail(patientEmail, appointmentDetails);
                successCount++;

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (emailError) {
                console.error(`Failed to send reminder for appointment ${appointment._id}:`, emailError.message);
                failCount++;
            }
        }

        console.log(`✅ Appointment reminder job completed: ${successCount} sent, ${failCount} failed`);

    } catch (error) {
        console.error('❌ Appointment reminder cron job error:', error);
    }
};

/**
 * Initialize appointment reminder cron jobs
 */
const initAppointmentReminderCron = () => {
    // Run every day at 8:00 AM Vietnam time (UTC+7)
    // Cron expression: minute hour day month weekday
    cron.schedule('0 8 * * *', async () => {
        await sendAppointmentReminders();
    }, {
        scheduled: true,
        timezone: 'Asia/Ho_Chi_Minh'
    });

    console.log('📅 Appointment reminder cron job initialized (runs daily at 8:00 AM)');
};

module.exports = {
    initAppointmentReminderCron,
    sendAppointmentReminders // Export for manual testing
};
