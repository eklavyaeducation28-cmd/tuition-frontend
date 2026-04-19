import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Clock, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function StudentHomework() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/homework').then(r => setHomework(r.data)).finally(() => setLoading(false));
  }, []);

  const isOverdue = (due) => due && new Date(due) < new Date();
  const isPending = (due) => due && new Date(due) >= new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
        <p className="text-gray-500 text-sm">Assignments from your teachers</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {homework.map(hw => (
            <motion.div key={hw.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`card border-l-4 ${isOverdue(hw.due_date) ? 'border-red-400' : isPending(hw.due_date) ? 'border-student' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                    <span className="badge bg-student-light text-student">{hw.batch_name}</span>
                    {hw.due_date && (
                      <span className={`badge flex items-center gap-1 ${isOverdue(hw.due_date) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isOverdue(hw.due_date) ? <Clock size={10} /> : <CheckCircle size={10} />}
                        {isOverdue(hw.due_date) ? 'Overdue' : `Due ${format(new Date(hw.due_date), 'dd MMM')}`}
                      </span>
                    )}
                  </div>
                  {hw.description && <p className="text-sm text-gray-600">{hw.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Posted {format(new Date(hw.created_at), 'dd MMM yyyy')}</span>
                    {hw.file_url && (
                      <a href={hw.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                        <Paperclip size={11} /> Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {homework.length === 0 && <p className="text-center text-gray-400 py-8">No homework assigned</p>}
        </div>
      )}
    </div>
  );
}
