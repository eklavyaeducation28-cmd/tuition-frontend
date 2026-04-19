import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardList, MessageSquare, Users, Calendar, BarChart3, ArrowRight } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import api from '../../utils/api';

const quickLinks = [
  { to: '/teacher/tests',      icon: ClipboardList, label: 'Tests & Marks',  desc: 'Create tests, upload marks',    color: 'bg-teacher-light text-teacher' },
  { to: '/teacher/attendance', icon: Calendar,      label: 'Attendance',     desc: 'Mark student attendance',       color: 'bg-parent-light text-parent' },
  { to: '/teacher/homework',   icon: BookOpen,      label: 'Homework',       desc: 'Post assignments',              color: 'bg-student-light text-student' },
  { to: '/teacher/queries',    icon: MessageSquare, label: 'Queries',        desc: 'Reply to parent questions',     color: 'bg-admin-light text-admin' },
  { to: '/teacher/insights',   icon: BarChart3,     label: 'AI Insights',    desc: 'Performance alerts',            color: 'bg-red-50 text-red-500' },
];

export default function TeacherDashboard() {
  const [batches, setBatches] = useState([]);
  const [tests, setTests] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/teacher/batches'),
      api.get('/teacher/tests'),
      api.get('/teacher/queries'),
    ]).then(([b, t, q]) => {
      setBatches(b.data);
      setTests(t.data);
      setQueries(q.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalStudents = batches.reduce((s, b) => s + Number(b.student_count || 0), 0);
  const openQueries = queries.filter(q => q.status === 'open').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your classes and activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="My Batches"    value={batches.length}  icon={BookOpen}      color="blue"   to="/teacher/tests" />
            <StatCard title="Total Students" value={totalStudents}  icon={Users}         color="green"  />
            <StatCard title="Tests Created"  value={tests.length}   icon={ClipboardList} color="orange" to="/teacher/tests" />
            <StatCard title="Open Queries"   value={openQueries}    icon={MessageSquare} color="purple" to="/teacher/queries" />
          </>
        )}
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(0,0,0,0.07)' }}
                className="card flex items-center gap-3 cursor-pointer group py-4"
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                <ArrowRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent data */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Batches</h3>
            <Link to="/teacher/tests" className="text-xs text-teacher hover:underline flex items-center gap-1">
              View Tests <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {batches.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-teacher-light rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.subject}</p>
                </div>
                <span className="badge bg-teacher text-white">{b.student_count} students</span>
              </div>
            ))}
            {batches.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No batches assigned</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Tests</h3>
            <Link to="/teacher/tests" className="text-xs text-teacher hover:underline flex items-center gap-1">
              All Tests <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {tests.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">{t.test_name}</p>
                  <p className="text-xs text-gray-500">{t.batch_name} · {t.test_date?.split('T')[0]}</p>
                </div>
                <span className="text-xs text-gray-500">{t.marks_entered} marks</span>
              </div>
            ))}
            {tests.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No tests yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
