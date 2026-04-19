import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, Save } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'present', icon: Check, color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'absent', icon: X, color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'late', icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
];

export default function TeacherAttendance() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/teacher/batches').then(r => setBatches(r.data));
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    api.get(`/teacher/batches/${selectedBatch}/students`).then(r => {
      setStudents(r.data);
      const init = {};
      r.data.forEach(s => { init[s.id] = 'present'; });
      setAttendance(init);
    });
  }, [selectedBatch]);

  const handleSave = async () => {
    if (!selectedBatch || !date) return toast.error('Select batch and date');
    setSaving(true);
    try {
      const data = Object.entries(attendance).map(([student_id, status]) => ({ student_id, status }));
      await api.post('/teacher/attendance', { batch_id: selectedBatch, date, attendance_data: data });
      toast.success('Attendance saved');
    } finally {
      setSaving(false);
    }
  };

  const allPresent = () => {
    const updated = {};
    students.forEach(s => { updated[s.id] = 'present'; });
    setAttendance(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 text-sm">Mark student attendance</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="input w-auto flex-1 min-w-40">
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-auto" />
          {students.length > 0 && (
            <button onClick={allPresent} className="btn-primary border border-gray-200 text-sm hover:bg-gray-50">
              Mark All Present
            </button>
          )}
        </div>

        {students.length > 0 ? (
          <>
            <div className="space-y-2">
              {students.map(student => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">{student.full_name}</p>
                    <p className="text-xs text-gray-500">Roll: {student.roll_number}</p>
                  </div>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map(({ value, icon: Icon, color }) => (
                      <button
                        key={value}
                        onClick={() => setAttendance(p => ({ ...p, [student.id]: value }))}
                        className={`p-2 rounded-lg border-2 transition-all ${attendance[student.id] === value ? color : 'border-transparent bg-white hover:bg-gray-100'}`}
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary bg-teacher text-white hover:bg-teacher-dark flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 py-8">Select a batch to mark attendance</p>
        )}
      </div>
    </div>
  );
}
