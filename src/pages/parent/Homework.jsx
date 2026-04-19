import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Clock, CheckCircle, BookOpen } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';
import { SkeletonList } from '../../components/common/SkeletonLoader';

export default function ParentHomework() {
  const [children, setChildren] = useState([]);
  const [homework, setHomework] = useState([]);
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
    api.get('/parent/homework', { params: { student_id: selectedChild.id } })
      .then(r => setHomework(r.data))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const isOverdue = (due) => due && new Date(due) < new Date();
  const isPending = (due) => due && new Date(due) >= new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
          <p className="text-gray-500 text-sm">Assignments for your child</p>
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

      {loading ? <SkeletonList /> : (
        <div className="space-y-3">
          {homework.map(hw => (
            <motion.div
              key={hw.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card border-l-4 ${isOverdue(hw.due_date) ? 'border-red-400' : isPending(hw.due_date) ? 'border-parent' : 'border-gray-200'}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-parent-light rounded-xl flex-shrink-0">
                  <BookOpen size={16} className="text-parent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                    <span className="badge bg-parent-light text-parent">{hw.batch_name}</span>
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
                      <a href={hw.file_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline">
                        <Paperclip size={11} /> Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {homework.length === 0 && (
            <div className="card text-center py-12">
              <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">No homework assigned yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
