import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TeacherQueries() {
  const [queries, setQueries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('open');

  const fetchQueries = () => {
    api.get('/teacher/queries').then(r => setQueries(r.data));
  };

  useEffect(() => { fetchQueries(); }, []);

  const handleReply = async () => {
    if (!reply.trim()) return;
    await api.put(`/teacher/queries/${selected.id}/reply`, { reply });
    toast.success('Reply sent');
    setSelected(null);
    setReply('');
    fetchQueries();
  };

  const filtered = queries.filter(q => filter === 'all' || q.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Queries</h1>
        <p className="text-gray-500 text-sm">Parent questions about tests</p>
      </div>

      <div className="flex gap-2">
        {['open', 'replied', 'closed', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-teacher text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(q => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-sm text-gray-900">{q.parent_name}</span>
                  <span className="text-gray-400 text-xs">re: {q.test_name}</span>
                  <Badge label={q.status} variant={q.status} />
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">{q.message}</p>
                {q.reply && (
                  <div className="mt-2 bg-teacher-light rounded-lg p-2">
                    <p className="text-xs text-teacher font-medium mb-0.5">Your reply:</p>
                    <p className="text-sm text-gray-700">{q.reply}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">{format(new Date(q.created_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
              {q.status === 'open' && (
                <button onClick={() => { setSelected(q); setReply(''); }}
                  className="btn-primary bg-teacher text-white text-xs px-3 py-1.5 hover:bg-teacher-dark flex items-center gap-1 flex-shrink-0">
                  <MessageSquare size={12} /> Reply
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No queries</p>}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Reply to Query">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">From {selected.parent_name} · {selected.test_name}</p>
              <p className="text-sm text-gray-800">{selected.message}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
              <textarea rows={4} value={reply} onChange={e => setReply(e.target.value)} className="input resize-none" placeholder="Type your reply..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={handleReply} className="flex-1 btn-primary bg-teacher text-white hover:bg-teacher-dark flex items-center justify-center gap-2">
                <Send size={14} /> Send Reply
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
