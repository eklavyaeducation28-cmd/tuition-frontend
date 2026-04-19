import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BookOpen, Award, ClipboardList, UserCircle, ArrowRight } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { ProgressLineChart } from '../../components/common/Charts';
import api from '../../utils/api';

const quickLinks = [
  { to: '/student/profile',    icon: UserCircle,    label: 'My Profile',   desc: 'View your details',          color: 'bg-student-light text-student' },
  { to: '/student/marks',      icon: ClipboardList, label: 'My Marks',     desc: 'Test scores and trends',     color: 'bg-teacher-light text-teacher' },
  { to: '/student/attendance', icon: Calendar,      label: 'Attendance',   desc: 'Your attendance record',     color: 'bg-parent-light text-parent' },
  { to: '/student/homework',   icon: BookOpen,      label: 'Homework',     desc: 'Assignments and due dates',  color: 'bg-admin-light text-admin' },
];

export default function StudentDashboard() {
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/marks'),
      api.get('/student/attendance'),
      api.get('/student/homework'),
    ]).then(([m, a, h]) => {
      setMarks(m.data);
      setAttendance(a.data);
      setHomework(h.data);
    }).finally(() => setLoading(false));
  }, []);

  const avgScore = marks.length
    ? (marks.reduce((s, m) => s + parseFloat(m.percentage || 0), 0) / marks.length).toFixed(1)
    : 0;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendancePct = attendance.length ? ((presentCount / attendance.length) * 100).toFixed(1) : 0;
  const pendingHw = homework.filter(h => h.due_date && new Date(h.due_date) >= new Date()).length;

  // marks are already ordered ASC by test_date from the API
  // deduplicate by test_id just in case
  const uniqueMarks = useMemo(() => {
    const seen = new Set();
    return marks.filter(m => {
      if (seen.has(m.test_id)) return false;
      seen.add(m.test_id);
      return true;
    });
  }, [marks]);

  const chartLabels = uniqueMarks.slice(-8).map(m => m.test_name?.slice(0, 10) || '');
  const chartData   = uniqueMarks.slice(-8).map(m => parseFloat(m.percentage  || 0));
  const avgData     = uniqueMarks.slice(-8).map(m => parseFloat(m.class_avg   || 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 text-sm">Your academic overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Average Score" value={avgScore}      icon={TrendingUp}    color="orange" suffix="%" to="/student/marks" />
            <StatCard title="Attendance"    value={attendancePct} icon={Calendar}      color="green"  suffix="%" to="/student/attendance" />
            <StatCard title="Tests Taken"   value={marks.length}  icon={Award}         color="blue"   to="/student/marks" />
            <StatCard title="Pending HW"    value={pendingHw}     icon={BookOpen}      color="purple" to="/student/homework" />
          </>
        )}
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(0,0,0,0.07)' }}
                className="card flex flex-col items-center text-center gap-2 cursor-pointer group py-5"
              >
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon size={20} />
                </div>
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 hidden sm:block">{desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Performance chart */}
      {uniqueMarks.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Performance Trend</h3>
            <Link to="/student/marks" className="text-xs text-student hover:underline flex items-center gap-1">
              All Tests <ArrowRight size={12} />
            </Link>
          </div>
          <ProgressLineChart labels={chartLabels} studentData={chartData} avgData={avgData} color="#F59E0B" />
        </div>
      )}

      {/* Recent data */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Tests</h3>
            <Link to="/student/marks" className="text-xs text-student hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {[...uniqueMarks].reverse().slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">{m.test_name}</p>
                  <p className="text-xs text-gray-500">{m.batch_name}</p>
                </div>
                <span className={`font-bold text-sm ${parseFloat(m.percentage) >= 75 ? 'text-green-600' : parseFloat(m.percentage) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {parseFloat(m.percentage).toFixed(1)}%
                </span>
              </div>
            ))}
            {marks.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No tests yet</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Upcoming Homework</h3>
            <Link to="/student/homework" className="text-xs text-student hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {homework
              .filter(h => h.due_date && new Date(h.due_date) >= new Date())
              .slice(0, 5)
              .map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-student-light rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{h.title}</p>
                    <p className="text-xs text-gray-500">{h.batch_name}</p>
                  </div>
                  <span className="text-xs text-student font-medium whitespace-nowrap">
                    Due {h.due_date?.split('T')[0]}
                  </span>
                </div>
              ))}
            {pendingHw === 0 && <p className="text-gray-400 text-sm text-center py-4">No pending homework</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
