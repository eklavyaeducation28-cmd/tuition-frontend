import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, TrendingUp, Calendar, MessageSquare, ClipboardList, FileText, Bell, BookOpen, ArrowRight } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { ProgressLineChart } from '../../components/common/Charts';
import api from '../../utils/api';

const quickLinks = [
  { to: '/parent/marks',        icon: ClipboardList, label: 'View Marks',      desc: 'Test scores and trends',       color: 'bg-parent-light text-parent' },
  { to: '/parent/attendance',   icon: Calendar,      label: 'Attendance',      desc: 'Track attendance records',     color: 'bg-teacher-light text-teacher' },
  { to: '/parent/homework',     icon: BookOpen,      label: 'Homework',        desc: 'Assignments and due dates',    color: 'bg-student-light text-student' },
  { to: '/parent/report-card',  icon: FileText,      label: 'Report Card',     desc: 'Download PDF report',          color: 'bg-admin-light text-admin' },
  { to: '/parent/queries',      icon: MessageSquare, label: 'Ask a Query',     desc: 'Questions to teachers',        color: 'bg-yellow-50 text-yellow-600' },
  { to: '/parent/announcements',icon: Bell,          label: 'Announcements',   desc: 'School notices',               color: 'bg-red-50 text-red-500' },
];

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    api.get('/parent/children').then(r => {
      setChildren(r.data);
      if (r.data[0]) setSelectedChild(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    Promise.all([
      api.get('/parent/marks', { params: { student_id: selectedChild.id } }),
      api.get('/parent/attendance', { params: { student_id: selectedChild.id } }),
      api.get('/parent/queries'),
    ]).then(([m, a, q]) => {
      setMarks(m.data);
      setAttendance(a.data);
      setQueries(q.data);
    }).finally(() => setLoading(false));
  }, [selectedChild]);

  const avgScore = marks.length
    ? (marks.reduce((s, m) => s + parseFloat(m.percentage || 0), 0) / marks.length).toFixed(1)
    : 0;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendancePct = attendance.length ? ((presentCount / attendance.length) * 100).toFixed(1) : 0;
  const openQueries = queries.filter(q => q.status === 'open').length;

  const chartLabels = marks.slice(0, 8).reverse().map(m => m.test_name?.slice(0, 10));
  const chartData   = marks.slice(0, 8).reverse().map(m => parseFloat(m.percentage || 0));
  const avgData     = marks.slice(0, 8).reverse().map(m => parseFloat(m.class_avg || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-500 text-sm">Track your child's progress</p>
        </div>
        {children.length > 1 && (
          <select
            value={selectedChild?.id || ''}
            onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))}
            className="input w-auto"
          >
            {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        )}
      </div>

      {/* Child info banner */}
      {selectedChild && (
        <div className="card bg-gradient-to-r from-parent-light to-white flex items-center gap-3">
          <div className="p-3 bg-parent rounded-xl text-white flex-shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{selectedChild.full_name}</p>
            <p className="text-sm text-gray-500">
              Grade {selectedChild.grade || '—'} · Roll {selectedChild.roll_number || '—'}
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Average Score"  value={avgScore}      icon={TrendingUp}    color="green"  suffix="%" to="/parent/marks" />
            <StatCard title="Attendance"     value={attendancePct} icon={Calendar}      color="orange" suffix="%" to="/parent/attendance" />
            <StatCard title="Open Queries"   value={openQueries}   icon={MessageSquare} color="purple" to="/parent/queries" />
          </>
        )}
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(0,0,0,0.07)' }}
                className="card flex items-center gap-3 cursor-pointer group py-4"
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${color}`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{label}</p>
                  <p className="text-xs text-gray-400 truncate hidden sm:block">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 hidden sm:block" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Performance chart */}
      {marks.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Performance Trend</h3>
            <Link to="/parent/marks" className="text-xs text-parent hover:underline flex items-center gap-1">
              Full Report <ArrowRight size={12} />
            </Link>
          </div>
          <ProgressLineChart labels={chartLabels} studentData={chartData} avgData={avgData} color="#10B981" />
        </div>
      )}
    </div>
  );
}
