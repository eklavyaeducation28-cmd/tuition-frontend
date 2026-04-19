import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8 },
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between lg:px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-xs text-gray-400 uppercase tracking-wide">Welcome back</h1>
            <p className="font-semibold text-gray-900 text-sm">{user?.full_name}</p>
          </div>
          {/* Mobile: show name + logout */}
          <div className="flex items-center gap-1 lg:hidden">
            <span className="text-sm font-medium text-gray-700 truncate max-w-32">{user?.full_name}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
