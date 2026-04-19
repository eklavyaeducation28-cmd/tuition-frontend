import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import api from '../../utils/api';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/attendance').then(r => setAttendance(r.data)).finally(() => setLoading(false));
  }, []);

  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const pct = total ? ((present / total) * 100).toFixed(1) : 0;

  const statusColor = { present: 'bg-green-100 text-green-700', absent: 'bg-red-100 text-red-700', late: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm">Your attendance records</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'bg-gray-100 text-gray-700' },
          { label: 'Present', value: present, color: 'bg-green-100 text-green-700' },
          { label: 'Absent', value: absent, color: 'bg-red-100 text-red-700' },
          { label: 'Late', value: late, color: 'bg-yellow-100 text-yellow-700' },
        ].map(s => (
          <div key={s.label} className={`card ${s.color} text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Attendance</span>
            <span className={`font-bold ${parseFloat(pct) >= 75 ? 'text-green-600' : 'text-red-600'}`}>{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
              className={`h-full rounded-full ${parseFloat(pct) >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
            />
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Records</h3>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {attendance.map(a => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">{format(parseISO(a.date), 'EEEE, dd MMM yyyy')}</p>
                  <p className="text-xs text-gray-500">{a.batch_name}</p>
                </div>
                <span className={`badge ${statusColor[a.status]} capitalize`}>{a.status}</span>
              </motion.div>
            ))}
            {attendance.length === 0 && <p className="text-center text-gray-400 py-8">No records</p>}
          </div>
        )}
      </div>
    </div>
  );
}
