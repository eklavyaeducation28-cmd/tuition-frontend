import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';

// Pages
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminBatches from './pages/admin/Batches';
import AdminAnnouncements from './pages/admin/Announcements';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherTests from './pages/teacher/Tests';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherHomework from './pages/teacher/Homework';
import TeacherQueries from './pages/teacher/Queries';
import TeacherInsights from './pages/teacher/Insights';

// Parent
import ParentDashboard from './pages/parent/Dashboard';
import ParentMarks from './pages/parent/Marks';
import ParentAttendance from './pages/parent/Attendance';
import ParentReportCard from './pages/parent/ReportCard';
import ParentQueries from './pages/parent/Queries';
import ParentAnnouncements from './pages/parent/Announcements';

// Student
import StudentDashboard from './pages/student/Dashboard';
import StudentMarks from './pages/student/Marks';
import StudentAttendance from './pages/student/Attendance';
import StudentHomework from './pages/student/Homework';
import StudentProfile from './pages/student/Profile';

// Landing page
import Landing from './pages/Landing';

// Parent extra
import ParentHomework from './pages/parent/Homework';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><Layout><AdminUsers /></Layout></ProtectedRoute>} />
      <Route path="/admin/batches" element={<ProtectedRoute roles={['admin']}><Layout><AdminBatches /></Layout></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute roles={['admin']}><Layout><AdminAnnouncements /></Layout></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute roles={['teacher', 'admin']}><Layout><TeacherDashboard /></Layout></ProtectedRoute>} />
      <Route path="/teacher/tests" element={<ProtectedRoute roles={['teacher', 'admin']}><Layout><TeacherTests /></Layout></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute roles={['teacher', 'admin']}><Layout><TeacherAttendance /></Layout></ProtectedRoute>} />
      <Route path="/teacher/homework" element={<ProtectedRoute roles={['teacher', 'admin']}><Layout><TeacherHomework /></Layout></ProtectedRoute>} />
      <Route path="/teacher/queries" element={<ProtectedRoute roles={['teacher', 'admin']}><Layout><TeacherQueries /></Layout></ProtectedRoute>} />
      <Route path="/teacher/insights" element={<ProtectedRoute roles={['teacher', 'admin']}><Layout><TeacherInsights /></Layout></ProtectedRoute>} />

      {/* Parent */}
      <Route path="/parent" element={<ProtectedRoute roles={['parent']}><Layout><ParentDashboard /></Layout></ProtectedRoute>} />
      <Route path="/parent/marks" element={<ProtectedRoute roles={['parent']}><Layout><ParentMarks /></Layout></ProtectedRoute>} />
      <Route path="/parent/attendance" element={<ProtectedRoute roles={['parent']}><Layout><ParentAttendance /></Layout></ProtectedRoute>} />
      <Route path="/parent/report-card" element={<ProtectedRoute roles={['parent']}><Layout><ParentReportCard /></Layout></ProtectedRoute>} />
      <Route path="/parent/queries" element={<ProtectedRoute roles={['parent']}><Layout><ParentQueries /></Layout></ProtectedRoute>} />
      <Route path="/parent/announcements" element={<ProtectedRoute roles={['parent']}><Layout><ParentAnnouncements /></Layout></ProtectedRoute>} />
      <Route path="/parent/homework" element={<ProtectedRoute roles={['parent']}><Layout><ParentHomework /></Layout></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
      <Route path="/student/marks" element={<ProtectedRoute roles={['student']}><Layout><StudentMarks /></Layout></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute roles={['student']}><Layout><StudentAttendance /></Layout></ProtectedRoute>} />
      <Route path="/student/homework" element={<ProtectedRoute roles={['student']}><Layout><StudentHomework /></Layout></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><Layout><StudentProfile /></Layout></ProtectedRoute>} />

      {/* Landing page — always public, even when logged in */}
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { borderRadius: '12px', background: '#1f2937', color: '#fff', fontSize: '14px' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
