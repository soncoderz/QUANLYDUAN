# 🏥 Healthcare Booking System

Hệ thống đặt lịch khám bệnh hoàn chỉnh với quản lý hồ sơ sức khỏe .

## 📌 Tổng quan

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB + Mongoose  
- **Auth**: JWT (access token 15 phút + refresh token 7 ngày)

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- MongoDB (local hoặc MongoDB Atlas)

### Backend

```bash
cd server
npm install
npm run seed    # Tạo dữ liệu mẫu
npm run dev     # Chạy server tại http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev     # Chạy tại http://localhost:3000
```

## 🔐 Tài khoản Demo

| Role | Email | Password |
|------|-------|----------|
| Patient | patient1@test.com | 12345678 |
| Patient | patient2@test.com | 12345678 |
| Doctor | doctor1@test.com | 12345678 |
| Admin | admin1@test.com | 12345678 |

## 📊 Tính năng

### Bệnh nhân
- ✅ Đăng ký/Đăng nhập
- ✅ Quản lý hồ sơ cá nhân
- ✅ Tìm kiếm phòng khám
- ✅ Đặt lịch khám (3 bước: chọn bác sĩ → chọn giờ → xác nhận)
- ✅ Xem/hủy lịch hẹn
- ✅ Xem hồ sơ bệnh án
- ✅ Quản lý thuốc & nhắc nhở
- ✅ Nhập chỉ số sức khỏe
- ✅ Xem báo cáo (3 loại + dashboard)

### Bác sĩ
- ✅ Dashboard riêng
- ✅ Xem lịch khám
- ✅ Xác nhận/hoàn thành lịch hẹn
- ✅ Tạo hồ sơ bệnh án

## 🔌 API Endpoints

### Auth (6)
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Profile (4)
- `GET /api/profile` - Xem profile
- `PUT /api/profile` - Cập nhật profile
- `POST /api/profile/avatar` - Upload avatar
- `GET /api/profile/:id` - Admin xem profile

### Clinics (4)
- `GET /api/clinics` - Danh sách phòng khám
- `GET /api/clinics/:id` - Chi tiết phòng khám
- `GET /api/clinics/search` - Tìm kiếm
- `GET /api/clinics/:id/available-slots` - Lịch trống

### Appointments (8)
- `GET /api/appointments` - Danh sách lịch
- `GET /api/appointments/:id` - Chi tiết lịch
- `POST /api/appointments` - Đặt lịch mới
- `PUT /api/appointments/:id` - Cập nhật lịch
- `DELETE /api/appointments/:id` - Hủy lịch
- `GET /api/appointments/upcoming` - Lịch sắp tới
- `POST /api/appointments/:id/confirm` - Xác nhận (doctor)
- `POST /api/appointments/:id/complete` - Hoàn thành (doctor)

### Medical Records (5)
- `GET /api/records` - Danh sách hồ sơ
- `GET /api/records/:id` - Chi tiết hồ sơ
- `POST /api/records` - Tạo hồ sơ (doctor)
- `PUT /api/records/:id` - Cập nhật hồ sơ
- `DELETE /api/records/:id` - Xóa hồ sơ

### Medications (6)
- `GET /api/medications` - Danh sách thuốc
- `POST /api/medications` - Thêm thuốc
- `PUT /api/medications/:id` - Cập nhật thuốc
- `DELETE /api/medications/:id` - Xóa thuốc
- `POST /api/medications/:id/reminders` - Tạo lời nhắc
- `PUT /api/reminders/:id` - Cập nhật lời nhắc

### Health Metrics (4)
- `GET /api/health-metrics` - Danh sách chỉ số
- `POST /api/health-metrics` - Thêm chỉ số
- `GET /api/health-metrics/trends` - Xu hướng
- `GET /api/health-metrics/latest` - Chỉ số mới nhất

### Reports (4)
- `GET /api/reports/dashboard` - Dashboard overview
- `GET /api/reports/medication-adherence` - Tuân thủ uống thuốc
- `GET /api/reports/metric-trends` - Xu hướng chỉ số
- `GET /api/reports/appointments` - Tần suất khám

## 📁 Cấu trúc thư mục

```
├── server/
│   ├── config/          # Database config
│   ├── controllers/     # API controllers (9 files)
│   ├── middleware/      # Auth, validation, rate limit
│   ├── models/          # Mongoose schemas (9 models)
│   ├── routes/          # API routes (10 files)
│   ├── seed/            # Seed data
│   ├── utils/           # Helpers, token utils
│   └── server.js
│
├── client/
│   ├── src/
│   │   ├── components/  # Layout, shared components
│   │   ├── context/     # Auth, Toast contexts
│   │   ├── pages/       # 12+ page components
│   │   ├── services/    # API service functions
│   │   └── App.jsx
│   └── vite.config.js
│
└── README.md
```

## 🛡️ Bảo mật

- JWT với access token (15 phút) + refresh token (7 ngày)
- Password hash với bcrypt (salt rounds = 10)
- Rate limiting: 100 requests/15 phút (API), 10 requests/15 phút (Auth)
- Input validation với Joi
- Role-based authorization

## 📝 License

MIT
