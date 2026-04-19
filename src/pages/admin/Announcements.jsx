import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Paperclip } from 'lucide-react';
import Modal from '../../components/common/Modal';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', target_batch_id: '' });
  const [file, setFile] = useState(null);

  const fetchData = () => {
    Promise.all([api.get('/announcements'), api.get('/admin/batches')])
      .then(([a, b]) => { setAnnouncements(a.data); setBatches(b.data); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (file) fd.append('file', file);
    await api.post('/announcements', fd);
    toast.success('Announcement posted');
    setShowModal(false);
    setForm({ title: '', content: '', target_batch_id: '' });
    setFile(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    await api.delete(`/announcements/${id}`);
    toast.success('Deleted');
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm">Post circulars and notices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary bg-admin text-white hover:bg-admin-dark flex items-center gap-2">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map(a => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  {a.batch_name && <span className="badge bg-purple-100 text-purple-700">{a.batch_name}</span>}
                  {!a.target_batch_id && <span className="badge bg-gray-100 text-gray-600">All Batches</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{a.created_by_name}</span>
                  <span>{format(new Date(a.created_at), 'dd MMM yyyy')}</span>
                  {a.file_url && (
                    <a href={a.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                      <Paperclip size={12} /> Attachment
                    </a>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {announcements.length === 0 && <p className="text-center text-gray-400 py-8">No announcements yet</p>}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea required rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Batch (optional)</label>
            <select value={form.target_batch_id} onChange={e => setForm(p => ({ ...p, target_batch_id: e.target.value }))} className="input">
              <option value="">All Batches</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 btn-primary bg-admin text-white hover:bg-admin-dark">Post</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
