import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Calendar,
  MessageSquare, Bell, FileText, LogOut, GraduationCap, BarChart3,
  Home, KeyRound, UserCircle,
} from 'lucide-react';

const roleColors = {
  admin: 'bg-admin text-white',
  teacher: 'bg-teacher text-white',
  parent: 'bg-parent text-white',
  student: 'bg-student text-white',
};

const roleNavs = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/batches', icon: BookOpen, label: 'Batches' },
    { to: '/admin/announcements', icon: Bell, label: 'Announcements' },
  ],
  teacher: [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/tests', icon: ClipboardList, label: 'Tests & Marks' },
    { to: '/teacher/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/teacher/homework', icon: BookOpen, label: 'Homework' },
    { to: '/teacher/queries', icon: MessageSquare, label: 'Queries' },
    { to: '/teacher/insights', icon: BarChart3, label: 'AI Insights' },
  ],
  parent: [
    { to: '/parent', icon: Home, label: 'Dashboard' },
    { to: '/parent/marks', icon: ClipboardList, label: 'Marks' },
    { to: '/parent/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/parent/homework', icon: BookOpen, label: 'Homework' },
    { to: '/parent/report-card', icon: FileText, label: 'Report Card' },
    { to: '/parent/queries', icon: MessageSquare, label: 'Queries' },
    { to: '/parent/announcements', icon: Bell, label: 'Announcements' },
  ],
  student: [
    { to: '/student', icon: Home, label: 'Dashboard' },
    { to: '/student/profile', icon: UserCircle, label: 'My Profile' },
    { to: '/student/marks', icon: ClipboardList, label: 'My Marks' },
    { to: '/student/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/student/homework', icon: BookOpen, label: 'Homework' },
  ],
};

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = roleNavs[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-5 flex-shrink-0 ${roleColors[user?.role]}`}>
        <div className="flex items-center gap-3">
          <GraduationCap size={26} />
          <div>
            <p className="font-bold text-base leading-tight">EduPortal</p>
            <p className="text-xs opacity-80 capitalize">{user?.role} Panel</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <p className="font-semibold text-sm text-gray-800 truncate">{user?.full_name}</p>
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length === 2}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `${roleColors[user?.role]} shadow-sm`
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 space-y-0.5 flex-shrink-0">
        <NavLink
          to="/change-password"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`
          }
        >
          <KeyRound size={17} />
          Change Password
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* ── DESKTOP: always visible static sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* ── MOBILE: slide-in drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-20 lg:hidden"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-30 lg:hidden"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
