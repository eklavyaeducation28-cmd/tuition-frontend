import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, ClipboardList, GraduationCap, Bell, ArrowRight } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { BatchBarChart } from '../../components/common/Charts';
import api from '../../utils/api';

const quickLinks = [
  { to: '/admin/users', icon: Users, label: 'Manage Users', desc: 'Add, edit and reset passwords', color: 'bg-admin-light text-admin' },
  { to: '/admin/batches', icon: BookOpen, label: 'Manage Batches', desc: 'Create batches & enroll students', color: 'bg-teacher-light text-teacher' },
  { to: '/admin/announcements', icon: Bell, label: 'Announcements', desc: 'Post circulars and notices', color: 'bg-parent-light text-parent' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const getUserCount = (role) => stats?.users?.find(u => u.role === role)?.count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">System overview and statistics</p>
      </div>

      {/* Stat cards — all clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Teachers" value={getUserCount('teacher')} icon={Users} color="blue" to="/admin/users?role=teacher" />
            <StatCard title="Total Parents"  value={getUserCount('parent')}  icon={Users} color="green" to="/admin/users?role=parent" />
            <StatCard title="Total Students" value={getUserCount('student')} icon={GraduationCap} color="orange" to="/admin/users?role=student" />
            <StatCard title="Active Batches" value={stats?.batches || 0}     icon={BookOpen} color="purple" to="/admin/batches" />
          </>
        )}
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                className="card flex items-center gap-4 cursor-pointer group"
              >
                <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Tests Overview</h3>
          {loading ? <div className="skeleton h-64 rounded-xl" /> : (
            <BatchBarChart labels={['Total Tests']} data={[stats?.tests || 0]} color="#8B5CF6" />
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">User Distribution</h3>
          {loading ? <div className="skeleton h-64 rounded-xl" /> : (
            <div className="space-y-4 pt-2">
              {[
                { role: 'Teachers', count: getUserCount('teacher'), color: 'bg-teacher', to: '/admin/users?role=teacher' },
                { role: 'Parents',  count: getUserCount('parent'),  color: 'bg-parent',  to: '/admin/users?role=parent' },
                { role: 'Students', count: getUserCount('student'), color: 'bg-student', to: '/admin/users?role=student' },
              ].map(({ role, count, color, to }) => (
                <Link key={role} to={to} className="block group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{role}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Number(count) * 10, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
