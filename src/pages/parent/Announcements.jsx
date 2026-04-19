import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Paperclip } from 'lucide-react';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    api.get('/parent/children').then(r => {
      setChildren(r.data);
      if (r.data[0]) setSelectedChild(r.data[0]);
    });
  }, []);

  useEffect(() => {
    api.get('/parent/announcements', { params: selectedChild ? { student_id: selectedChild.id } : {} })
      .then(r => setAnnouncements(r.data));
  }, [selectedChild]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm">School notices and circulars</p>
        </div>
        {children.length > 1 && (
          <select value={selectedChild?.id || ''} onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))} className="input w-auto">
            {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        )}
      </div>

      <div className="space-y-3">
        {announcements.map(a => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-parent-light rounded-xl flex-shrink-0">
                <Bell size={16} className="text-parent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  {a.batch_name && <span className="badge bg-parent-light text-parent">{a.batch_name}</span>}
                  {!a.target_batch_id && <span className="badge bg-gray-100 text-gray-600">All</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{a.created_by_name}</span>
                  <span>{format(new Date(a.created_at), 'dd MMM yyyy')}</span>
                  {a.file_url && (
                    <a href={a.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                      <Paperclip size={11} /> Attachment
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {announcements.length === 0 && <p className="text-center text-gray-400 py-8">No announcements</p>}
      </div>
    </div>
  );
}
