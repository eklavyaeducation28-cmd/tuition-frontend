import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ParentQueries() {
  const [queries, setQueries] = useState([]);
  const [children, setChildren] = useState([]);
  const [tests, setTests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ test_id: '', student_id: '', message: '' });

  const fetchData = () => {
    Promise.all([api.get('/parent/queries'), api.get('/parent/children')])
      .then(([q, c]) => { setQueries(q.data); setChildren(c.data); });
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (form.student_id) {
      api.get('/parent/marks', { params: { student_id: form.student_id } })
        .then(r => setTests(r.data.map(m => ({ id: m.test_id, name: m.test_name }))));
    }
  }, [form.student_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/parent/queries', form);
    toast.success('Query submitted');
    setShowModal(false);
    setForm({ test_id: '', student_id: '', message: '' });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queries</h1>
          <p className="text-gray-500 text-sm">Ask questions about tests</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary bg-parent text-white hover:bg-parent-dark flex items-center gap-2">
          <Plus size={16} /> New Query
        </button>
      </div>

      <div className="space-y-3">
        {queries.map(q => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs text-gray-500">Re: {q.test_name}</span>
                  <Badge label={q.status} variant={q.status} />
                </div>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-2">{q.message}</p>
                {q.reply && (
                  <div className="mt-2 bg-parent-light rounded-lg p-2">
                    <p className="text-xs text-parent font-medium mb-0.5">Teacher's reply:</p>
                    <p className="text-sm text-gray-700">{q.reply}</p>
                    {q.replied_at && <p className="text-xs text-gray-400 mt-1">{format(new Date(q.replied_at), 'dd MMM, HH:mm')}</p>}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">{format(new Date(q.created_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {queries.length === 0 && <p className="text-center text-gray-400 py-8">No queries yet</p>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ask a Query">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
            <select required value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} className="input">
              <option value="">Select child</option>
              {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test</label>
            <select required value={form.test_id} onChange={e => setForm(p => ({ ...p, test_id: e.target.value }))} className="input" disabled={!form.student_id}>
              <option value="">Select test</option>
              {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Question</label>
            <textarea required rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="input resize-none" placeholder="Describe your query..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 btn-primary bg-parent text-white hover:bg-parent-dark">Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
