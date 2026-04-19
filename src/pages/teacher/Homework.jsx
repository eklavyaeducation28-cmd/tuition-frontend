import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Paperclip, Calendar } from 'lucide-react';
import Modal from '../../components/common/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TeacherHomework() {
  const [homework, setHomework] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ batch_id: '', title: '', description: '', due_date: '' });
  const [file, setFile] = useState(null);

  const fetchData = () => {
    Promise.all([api.get('/teacher/homework'), api.get('/teacher/batches')])
      .then(([h, b]) => { setHomework(h.data); setBatches(b.data); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (file) fd.append('file', file);
    await api.post('/teacher/homework', fd);
    toast.success('Homework posted');
    setShowModal(false);
    setForm({ batch_id: '', title: '', description: '', due_date: '' });
    setFile(null);
    fetchData();
  };

  const isOverdue = (due) => due && new Date(due) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homework</h1>
          <p className="text-gray-500 text-sm">Post assignments for your batches</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary bg-teacher text-white hover:bg-teacher-dark flex items-center gap-2">
          <Plus size={16} /> Post Homework
        </button>
      </div>

      <div className="space-y-3">
        {homework.map(hw => (
          <motion.div key={hw.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                  <span className="badge bg-teacher-light text-teacher">{hw.batch_name}</span>
                  {hw.due_date && (
                    <span className={`badge ${isOverdue(hw.due_date) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      Due: {format(new Date(hw.due_date), 'dd MMM')}
                    </span>
                  )}
                </div>
                {hw.description && <p className="text-sm text-gray-600 mt-1">{hw.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={11} /> {format(new Date(hw.created_at), 'dd MMM yyyy')}</span>
                  {hw.file_url && (
                    <a href={hw.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                      <Paperclip size={11} /> Attachment
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {homework.length === 0 && <p className="text-center text-gray-400 py-8">No homework posted yet</p>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post Homework">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select required value={form.batch_id} onChange={e => setForm(p => ({ ...p, batch_id: e.target.value }))} className="input">
              <option value="">Select batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="input focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 btn-primary bg-teacher text-white hover:bg-teacher-dark">Post</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
