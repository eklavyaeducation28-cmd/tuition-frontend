import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import api from '../../utils/api';

const STATUS_COLORS = {
  present: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-yellow-500',
};

export default function ParentAttendance() {
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/parent/children').then(r => {
      setChildren(r.data);
      if (r.data[0]) setSelectedChild(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    api.get('/parent/attendance', { params: { student_id: selectedChild.id } })
      .then(r => setAttendance(r.data))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const pct = total ? ((present / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm">Track attendance records</p>
        </div>
        {children.length > 1 && (
          <select value={selectedChild?.id || ''} onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))} className="input w-auto">
            {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: total, color: 'bg-gray-100 text-gray-700' },
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

      {/* Attendance bar */}
      {total > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Overall Attendance</span>
            <span className={`font-bold ${parseFloat(pct) >= 75 ? 'text-green-600' : 'text-red-600'}`}>{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${parseFloat(pct) >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
            />
          </div>
          {parseFloat(pct) < 75 && (
            <p className="text-xs text-red-500 mt-1">Attendance below 75% may affect performance</p>
          )}
        </div>
      )}

      {/* Records */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Attendance Records</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {attendance.map(a => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-900">{format(parseISO(a.date), 'EEEE, dd MMM yyyy')}</p>
                  <p className="text-xs text-gray-500">{a.batch_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[a.status]}`} />
                  <span className="text-sm capitalize text-gray-700">{a.status}</span>
                </div>
              </motion.div>
            ))}
            {attendance.length === 0 && <p className="text-center text-gray-400 py-8">No attendance records</p>}
          </div>
        )}
      </div>
    </div>
  );
}
