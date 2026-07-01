import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedWardenRoute, ProtectedStudentRoute } from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import WardenLogin from './pages/WardenLogin';
import WardenRegister from './pages/WardenRegister';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import StudentMovement from './pages/StudentMovement';
import StudentHistory from './pages/StudentHistory';
import WardenDashboard from './pages/WardenDashboard';
import StudentManagement from './pages/StudentManagement';
import LiveStatusPage from './pages/LiveStatusPage';
import ReportsPage from './pages/ReportsPage';
import PermissionsPage from './pages/PermissionsPage';
import LeavesPage from './pages/LeavesPage';
import NotificationsPage from './pages/NotificationsPage';

// Portal Enhancement Pages
import GateLogin from './pages/GateLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentStaffRequest from './pages/StudentStaffRequest';
import StudentLeaveRequest from './pages/StudentLeaveRequest';
import StudentEmergency from './pages/StudentEmergency';
import StudentAttendance from './pages/StudentAttendance';
import StudentReports from './pages/StudentReports';
import StudentProfile from './pages/StudentProfile';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#f9fafb',
                border: '1px solid rgba(75,85,99,0.4)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#111827' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#111827' },
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Gate Portal */}
            <Route path="/gate/login" element={<GateLogin />} />
            <Route path="/gate/entry" element={
              <ProtectedWardenRoute><StudentMovement /></ProtectedWardenRoute>
            } />
            <Route path="/movement" element={<Navigate to="/gate/entry" replace />} />

            {/* Warden auth */}
            <Route path="/warden/login" element={<WardenLogin />} />

            {/* Student auth */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<StudentRegister />} />

            {/* Protected Student Portal routes */}
            <Route path="/student/dashboard" element={
              <ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>
            } />
            <Route path="/student/request-staff" element={
              <ProtectedStudentRoute><StudentStaffRequest /></ProtectedStudentRoute>
            } />
            <Route path="/student/request-leave" element={
              <ProtectedStudentRoute><StudentLeaveRequest /></ProtectedStudentRoute>
            } />
            <Route path="/student/emergency" element={
              <ProtectedStudentRoute><StudentEmergency /></ProtectedStudentRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedStudentRoute><StudentAttendance /></ProtectedStudentRoute>
            } />
            <Route path="/student/reports" element={
              <ProtectedStudentRoute><StudentReports /></ProtectedStudentRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedStudentRoute><StudentProfile /></ProtectedStudentRoute>
            } />
            <Route path="/student/history" element={<Navigate to="/student/dashboard" replace />} />

            {/* Protected warden routes */}
            <Route path="/warden/dashboard" element={
              <ProtectedWardenRoute><WardenDashboard /></ProtectedWardenRoute>
            } />
            <Route path="/warden/students" element={
              <ProtectedWardenRoute><StudentManagement /></ProtectedWardenRoute>
            } />
            <Route path="/warden/live-status" element={
              <ProtectedWardenRoute><LiveStatusPage /></ProtectedWardenRoute>
            } />
            <Route path="/warden/reports" element={
              <ProtectedWardenRoute><ReportsPage /></ProtectedWardenRoute>
            } />
            <Route path="/warden/permissions" element={
              <ProtectedWardenRoute><PermissionsPage /></ProtectedWardenRoute>
            } />
            <Route path="/warden/leaves" element={
              <ProtectedWardenRoute><LeavesPage /></ProtectedWardenRoute>
            } />
            <Route path="/warden/notifications" element={
              <ProtectedWardenRoute><NotificationsPage /></ProtectedWardenRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
