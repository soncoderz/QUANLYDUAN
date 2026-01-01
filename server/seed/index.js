const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Medication = require('../models/Medication');
const Reminder = require('../models/Reminder');
const HealthMetric = require('../models/HealthMetric');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI );
        console.log('MongoDB Connected for seeding');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            PatientProfile.deleteMany({}),
            Clinic.deleteMany({}),
            Doctor.deleteMany({}),
            Appointment.deleteMany({}),
            MedicalRecord.deleteMany({}),
            Medication.deleteMany({}),
            Reminder.deleteMany({}),
            HealthMetric.deleteMany({})
        ]);

        console.log('Creating users...');

        // Create Users one by one to trigger pre-save password hashing hook
        const user1 = await User.create({ email: 'patient1@test.com', password: '12345678', phone: '0901234567', role: 'patient' });
        const user2 = await User.create({ email: 'patient2@test.com', password: '12345678', phone: '0902345678', role: 'patient' });
        const user3 = await User.create({ email: 'doctor1@test.com', password: '12345678', phone: '0903456789', role: 'doctor' });
        const user4 = await User.create({ email: 'doctor2@test.com', password: '12345678', phone: '0904567890', role: 'doctor' });
        const user5 = await User.create({ email: 'admin1@test.com', password: '12345678', phone: '0905678901', role: 'clinic_admin' });

        const users = [user1, user2, user3, user4, user5];

        console.log('Creating patient profiles...');

        // Create Patient Profiles
        const profiles = await PatientProfile.create([
            {
                userId: users[0]._id,
                fullName: 'Nguyễn Văn An',
                dateOfBirth: new Date('1990-05-15'),
                gender: 'male',
                bloodType: 'A+',
                allergies: ['Penicillin'],
                emergencyContact: 'Nguyễn Thị Bình',
                emergencyPhone: '0911111111',
                address: '123 Lê Lợi, Quận 1, TP.HCM'
            },
            {
                userId: users[1]._id,
                fullName: 'Trần Thị Hương',
                dateOfBirth: new Date('1985-08-20'),
                gender: 'female',
                bloodType: 'O+',
                allergies: [],
                emergencyContact: 'Trần Văn Cường',
                emergencyPhone: '0922222222',
                address: '456 Nguyễn Huệ, Quận 3, TP.HCM'
            }
        ]);

        console.log('Creating clinics...');

        // Create Clinics
        const clinics = await Clinic.create([
            {
                name: 'Phòng khám Đa khoa ABC',
                address: '123 Lê Lợi, Quận 1, TP.HCM',
                phone: '028-1234-5678',
                email: 'contact@clinicabc.vn',
                specialty: ['internal_medicine', 'cardiology', 'neurology'],
                description: 'Phòng khám đa khoa uy tín với đội ngũ bác sĩ giàu kinh nghiệm',
                rating: 4.8,
                totalReviews: 156,
                workingHours: {
                    monday: { open: '08:00', close: '17:00' },
                    tuesday: { open: '08:00', close: '17:00' },
                    wednesday: { open: '08:00', close: '17:00' },
                    thursday: { open: '08:00', close: '17:00' },
                    friday: { open: '08:00', close: '17:00' },
                    saturday: { open: '08:00', close: '12:00' },
                    sunday: { open: null, close: null }
                }
            },
            {
                name: 'Bệnh viện XYZ',
                address: '456 Nguyễn Huệ, Quận 1, TP.HCM',
                phone: '028-8765-4321',
                email: 'info@hospitalxyz.vn',
                specialty: ['surgery', 'pediatrics', 'orthopedics'],
                description: 'Bệnh viện đa khoa với trang thiết bị hiện đại',
                rating: 4.5,
                totalReviews: 234,
                workingHours: {
                    monday: { open: '07:00', close: '20:00' },
                    tuesday: { open: '07:00', close: '20:00' },
                    wednesday: { open: '07:00', close: '20:00' },
                    thursday: { open: '07:00', close: '20:00' },
                    friday: { open: '07:00', close: '20:00' },
                    saturday: { open: '07:00', close: '17:00' },
                    sunday: { open: '08:00', close: '12:00' }
                }
            },
            {
                name: 'Phòng khám Nhi ABC',
                address: '789 Điện Biên Phủ, Quận 3, TP.HCM',
                phone: '028-1111-2222',
                email: 'nhi@clinicabc.vn',
                specialty: ['pediatrics'],
                description: 'Chuyên khoa nhi với không gian thân thiện cho trẻ em',
                rating: 4.7,
                totalReviews: 89
            }
        ]);

        console.log('Creating doctors...');

        // Create Doctors
        const doctors = await Doctor.create([
            {
                userId: users[2]._id,
                clinicId: clinics[0]._id,
                fullName: 'BS. Lê Văn Minh',
                specialty: 'Nội khoa',
                licenseNumber: 'VN-DOC-001',
                experience: 15,
                education: 'Đại học Y Dược TP.HCM',
                description: 'Bác sĩ chuyên khoa nội với 15 năm kinh nghiệm',
                consultationFee: 300000
            },
            {
                userId: users[3]._id,
                clinicId: clinics[0]._id,
                fullName: 'BS. Phạm Thị Lan',
                specialty: 'Tim mạch',
                licenseNumber: 'VN-DOC-002',
                experience: 10,
                education: 'Đại học Y Hà Nội',
                description: 'Chuyên gia tim mạch hàng đầu',
                consultationFee: 500000
            },
            {
                userId: users[4]._id,
                clinicId: clinics[1]._id,
                fullName: 'BS. Trần Quốc Hùng',
                specialty: 'Phẫu thuật',
                licenseNumber: 'VN-DOC-003',
                experience: 20,
                education: 'Đại học Y Dược TP.HCM',
                description: 'Chuyên gia phẫu thuật tổng quát',
                consultationFee: 400000
            }
        ]);

        console.log('Creating appointments...');

        // Create Appointments
        const today = new Date();
        const appointments = await Appointment.create([
            // Past completed appointments
            {
                patientId: users[0]._id,
                clinicId: clinics[0]._id,
                doctorId: doctors[0]._id,
                appointmentDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
                timeSlot: '09:00',
                status: 'completed',
                type: 'consultation',
                reason: 'Khám tổng quát',
                completedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
            },
            {
                patientId: users[0]._id,
                clinicId: clinics[0]._id,
                doctorId: doctors[1]._id,
                appointmentDate: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
                timeSlot: '10:00',
                status: 'completed',
                type: 'checkup',
                reason: 'Kiểm tra tim mạch',
                completedAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)
            },
            {
                patientId: users[1]._id,
                clinicId: clinics[0]._id,
                doctorId: doctors[0]._id,
                appointmentDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
                timeSlot: '14:00',
                status: 'completed',
                type: 'consultation',
                reason: 'Đau đầu kéo dài',
                completedAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                patientId: users[0]._id,
                clinicId: clinics[1]._id,
                doctorId: doctors[2]._id,
                appointmentDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
                timeSlot: '11:00',
                status: 'completed',
                type: 'follow-up',
                reason: 'Tái khám sau phẫu thuật',
                completedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                patientId: users[1]._id,
                clinicId: clinics[0]._id,
                doctorId: doctors[1]._id,
                appointmentDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
                timeSlot: '09:30',
                status: 'completed',
                type: 'checkup',
                reason: 'Khám định kỳ',
                completedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
            },
            // Future confirmed appointments
            {
                patientId: users[0]._id,
                clinicId: clinics[0]._id,
                doctorId: doctors[0]._id,
                appointmentDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
                timeSlot: '10:00',
                status: 'confirmed',
                type: 'follow-up',
                reason: 'Tái khám theo lịch hẹn',
                confirmedAt: new Date()
            },
            {
                patientId: users[1]._id,
                clinicId: clinics[0]._id,
                doctorId: doctors[1]._id,
                appointmentDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
                timeSlot: '14:30',
                status: 'confirmed',
                type: 'consultation',
                reason: 'Khám tim mạch',
                confirmedAt: new Date()
            },
            {
                patientId: users[0]._id,
                clinicId: clinics[1]._id,
                doctorId: doctors[2]._id,
                appointmentDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
                timeSlot: '09:00',
                status: 'confirmed',
                type: 'checkup',
                reason: 'Kiểm tra sức khỏe tổng quát'
            },
            // Pending appointments
            {
                patientId: users[1]._id,
                clinicId: clinics[2]._id,
                doctorId: doctors[0]._id,
                appointmentDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
                timeSlot: '11:00',
                status: 'scheduled',
                type: 'consultation',
                reason: 'Khám bệnh mới'
            },
            {
                patientId: users[0]._id,
                clinicId: clinics[0]._id,
                doctorId: doctors[1]._id,
                appointmentDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
                timeSlot: '15:00',
                status: 'scheduled',
                type: 'checkup',
                reason: 'Kiểm tra sức khỏe'
            }
        ]);

        console.log('Creating medical records...');

        // Create Medical Records for completed appointments
        const records = await MedicalRecord.create([
            {
                patientId: users[0]._id,
                appointmentId: appointments[0]._id,
                doctorId: doctors[0]._id,
                diagnosis: 'Viêm họng cấp',
                treatment: 'Kháng sinh, giảm đau, nghỉ ngơi',
                doctorNotes: 'Bệnh nhân cần uống nhiều nước và nghỉ ngơi',
                symptoms: 'Đau họng, sốt nhẹ',
                vitalSigns: {
                    bloodPressure: '120/80',
                    heartRate: 72,
                    temperature: 37.5,
                    weight: 65
                }
            },
            {
                patientId: users[0]._id,
                appointmentId: appointments[1]._id,
                doctorId: doctors[1]._id,
                diagnosis: 'Tim mạch bình thường',
                treatment: 'Không cần điều trị, duy trì lối sống lành mạnh',
                doctorNotes: 'Khuyến nghị tập thể dục đều đặn',
                symptoms: 'Không có triệu chứng',
                vitalSigns: {
                    bloodPressure: '118/75',
                    heartRate: 68,
                    weight: 65
                }
            },
            {
                patientId: users[1]._id,
                appointmentId: appointments[2]._id,
                doctorId: doctors[0]._id,
                diagnosis: 'Đau đầu căng thẳng',
                treatment: 'Thuốc giảm đau, thư giãn, giảm stress',
                doctorNotes: 'Cần theo dõi thêm nếu triệu chứng kéo dài',
                symptoms: 'Đau đầu kéo dài 1 tuần',
                vitalSigns: {
                    bloodPressure: '125/82',
                    heartRate: 75,
                    weight: 55
                }
            },
            {
                patientId: users[0]._id,
                appointmentId: appointments[3]._id,
                doctorId: doctors[2]._id,
                diagnosis: 'Hồi phục tốt sau phẫu thuật',
                treatment: 'Tiếp tục chăm sóc vết thương',
                doctorNotes: 'Vết mổ lành tốt, có thể hoạt động nhẹ',
                vitalSigns: {
                    bloodPressure: '120/80',
                    heartRate: 70,
                    weight: 64
                }
            },
            {
                patientId: users[1]._id,
                appointmentId: appointments[4]._id,
                doctorId: doctors[1]._id,
                diagnosis: 'Sức khỏe tổng quát tốt',
                treatment: 'Duy trì chế độ ăn uống và tập luyện',
                doctorNotes: 'Khám lại sau 6 tháng',
                vitalSigns: {
                    bloodPressure: '115/75',
                    heartRate: 65,
                    weight: 54
                }
            }
        ]);

        console.log('Creating medications...');

        // Create Medications
        const medications = await Medication.create([
            {
                patientId: users[0]._id,
                recordId: records[0]._id,
                name: 'Amoxicillin 500mg',
                dosage: '500mg',
                frequency: '3 lần/ngày',
                instructions: 'Uống sau bữa ăn',
                startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(today.getTime() - 23 * 24 * 60 * 60 * 1000),
                isActive: false,
                prescribedBy: doctors[0]._id
            },
            {
                patientId: users[0]._id,
                name: 'Vitamin C 1000mg',
                dosage: '1000mg',
                frequency: '1 lần/ngày',
                instructions: 'Uống buổi sáng sau ăn',
                startDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
                isActive: true
            },
            {
                patientId: users[1]._id,
                recordId: records[2]._id,
                name: 'Panadol Extra',
                dosage: '500mg',
                frequency: '2 lần/ngày khi đau',
                instructions: 'Uống khi có triệu chứng đau đầu',
                startDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
                isActive: true,
                prescribedBy: doctors[0]._id
            },
            {
                patientId: users[0]._id,
                name: 'Omega 3',
                dosage: '1000mg',
                frequency: '1 lần/ngày',
                instructions: 'Uống trong bữa ăn',
                startDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
                isActive: true
            },
            {
                patientId: users[1]._id,
                name: 'Calcium + D3',
                dosage: '600mg',
                frequency: '1 lần/ngày',
                instructions: 'Uống buổi tối',
                startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
                isActive: true
            },
            {
                patientId: users[0]._id,
                name: 'Glucosamine',
                dosage: '1500mg',
                frequency: '1 lần/ngày',
                instructions: 'Uống buổi sáng',
                startDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
                isActive: true
            }
        ]);

        console.log('Creating reminders...');

        // Create Reminders
        const reminders = await Reminder.create([
            {
                medicationId: medications[1]._id,
                patientId: users[0]._id,
                reminderTime: '08:00',
                daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                isActive: true,
                takenHistory: [
                    { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000) },
                    { date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
                    { date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), taken: false },
                    { date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000) }
                ]
            },
            {
                medicationId: medications[2]._id,
                patientId: users[1]._id,
                reminderTime: '09:00',
                daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                isActive: true,
                takenHistory: [
                    { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date() },
                    { date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date() }
                ]
            },
            {
                medicationId: medications[2]._id,
                patientId: users[1]._id,
                reminderTime: '21:00',
                daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                isActive: true
            },
            {
                medicationId: medications[3]._id,
                patientId: users[0]._id,
                reminderTime: '12:00',
                daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                isActive: true,
                takenHistory: [
                    { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date() },
                    { date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date() },
                    { date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), taken: true, takenAt: new Date() }
                ]
            },
            {
                medicationId: medications[4]._id,
                patientId: users[1]._id,
                reminderTime: '20:00',
                daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                isActive: true
            },
            {
                medicationId: medications[5]._id,
                patientId: users[0]._id,
                reminderTime: '07:30',
                daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                isActive: true
            }
        ]);

        console.log('Creating health metrics...');

        // Create Health Metrics (50 records for last 3 months)
        const healthMetrics = [];

        for (let i = 0; i < 90; i += 2) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);

            // Weight for patient 1
            if (i % 7 === 0) {
                healthMetrics.push({
                    patientId: users[0]._id,
                    metricType: 'weight',
                    value: 65 + Math.random() * 2 - 1,
                    unit: 'kg',
                    measuredAt: date
                });
            }

            // Blood pressure for patient 1
            if (i % 3 === 0) {
                healthMetrics.push({
                    patientId: users[0]._id,
                    metricType: 'blood_pressure',
                    value: 115 + Math.floor(Math.random() * 15),
                    secondaryValue: 75 + Math.floor(Math.random() * 10),
                    unit: 'mmHg',
                    measuredAt: date
                });
            }

            // Heart rate for patient 1
            if (i % 2 === 0) {
                healthMetrics.push({
                    patientId: users[0]._id,
                    metricType: 'heart_rate',
                    value: 68 + Math.floor(Math.random() * 15),
                    unit: 'bpm',
                    measuredAt: date
                });
            }

            // Glucose for patient 2
            if (i % 5 === 0) {
                healthMetrics.push({
                    patientId: users[1]._id,
                    metricType: 'glucose',
                    value: 90 + Math.floor(Math.random() * 20),
                    unit: 'mg/dL',
                    measuredAt: date
                });
            }

            // Weight for patient 2
            if (i % 7 === 0) {
                healthMetrics.push({
                    patientId: users[1]._id,
                    metricType: 'weight',
                    value: 54 + Math.random() * 2 - 1,
                    unit: 'kg',
                    measuredAt: date
                });
            }
        }

        await HealthMetric.insertMany(healthMetrics);

        console.log('\n========================================');
        console.log('✅ Seed data created successfully!');
        console.log('========================================');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Patient Profiles: ${profiles.length}`);
        console.log(`   Clinics: ${clinics.length}`);
        console.log(`   Doctors: ${doctors.length}`);
        console.log(`   Appointments: ${appointments.length}`);
        console.log(`   Medical Records: ${records.length}`);
        console.log(`   Medications: ${medications.length}`);
        console.log(`   Reminders: ${reminders.length}`);
        console.log(`   Health Metrics: ${healthMetrics.length}`);
        console.log('\n🔐 Test Accounts:');
        console.log('   Patient: patient1@test.com / 12345678');
        console.log('   Patient: patient2@test.com / 12345678');
        console.log('   Doctor: doctor1@test.com / 12345678');
        console.log('   Admin: admin1@test.com / 12345678');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
