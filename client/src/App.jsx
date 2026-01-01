import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layout
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import DoctorLayout from './components/DoctorLayout';

// Patient Pages
import Dashboard from './pages/patient/Dashboard';
import Clinics from './pages/patient/Clinics';
import Booking from './pages/patient/Booking';
import Appointments from './pages/patient/Appointments';
import MedicalRecords from './pages/patient/MedicalRecords';
import Medications from './pages/patient/Medications';
import HealthMetrics from './pages/patient/HealthMetrics';
import Reports from './pages/patient/Reports';
import Settings from './pages/patient/Settings';

// Admin Pages
import {
  AdminDashboard,
  UserManagement,
  DoctorManagement,
  ClinicManagement,
  AppointmentManagement,
  SystemReports
} from './pages/admin';

// Doctor Pages
import {
  DoctorDashboard,
  DoctorAppointments,
  DoctorPatients,
  DoctorSettings
} from './pages/doctor';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'clinic_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

// Doctor Protected Route Component
const DoctorRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'doctor') {
    return <Navigate to="/dashboard" replace />;
  }

  return <DoctorLayout>{children}</DoctorLayout>;
};

// Public Route Component (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on role
    if (user?.role === 'clinic_admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Root Redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'clinic_admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'doctor') {
    return <Navigate to="/doctor" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <AdminRoute>
            <DoctorManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/clinics"
        element={
          <AdminRoute>
            <ClinicManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <AdminRoute>
            <AppointmentManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <SystemReports />
          </AdminRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <DoctorRoute>
            <DoctorDashboard />
          </DoctorRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <DoctorRoute>
            <DoctorAppointments />
          </DoctorRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <DoctorRoute>
            <DoctorPatients />
          </DoctorRoute>
        }
      />
      <Route
        path="/doctor/settings"
        element={
          <DoctorRoute>
            <DoctorSettings />
          </DoctorRoute>
        }
      />

      {/* Protected Patient Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clinics"
        element={
          <ProtectedRoute>
            <Clinics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <Clinics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:clinicId"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/records"
        element={
          <ProtectedRoute>
            <MedicalRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medications"
        element={
          <ProtectedRoute>
            <Medications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <HealthMetrics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Default Route - Role based redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

