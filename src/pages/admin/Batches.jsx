import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Users, UserPlus, UserMinus } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [enrollBatch, setEnrollBatch] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [form, setForm] = useState({ name: '', subject: '', teacher_id: '' });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/batches'),
      api.get('/admin/users', { params: { role: 'teacher' } }),
    ]).then(([b, t]) => {
      setBatches(b.data);
      setTeachers(t.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', subject: '', teacher_id: '' });
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ name: b.name, subject: b.subject || '', teacher_id: b.teacher_id || '' });
    setShowModal(true);
  };

  const openEnroll = async (batch) => {
    setEnrollBatch(batch);
    const [enrolled, available] = await Promise.all([
      api.get(`/admin/batches/${batch.id}/students`),
      api.get(`/admin/batches/${batch.id}/students/available`),
    ]);
    setEnrolledStudents(enrolled.data);
    setAvailableStudents(available.data);
    setShowEnrollModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/admin/batches/${editing.id}`, form);
      toast.success('Batch updated');
    } else {
      await api.post('/admin/batches', form);
      toast.success('Batch created');
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this batch? This will remove all student enrollments.')) return;
    await api.delete(`/admin/batches/${id}`);
    toast.success('Batch deleted');
    fetchData();
  };

  const handleAddStudent = async (studentId) => {
    await api.post(`/admin/batches/${enrollBatch.id}/students`, { student_id: studentId });
    toast.success('Student added');
    const [enrolled, available] = await Promise.all([
      api.get(`/admin/batches/${enrollBatch.id}/students`),
      api.get(`/admin/batches/${enrollBatch.id}/students/available`),
    ]);
    setEnrolledStudents(enrolled.data);
    setAvailableStudents(available.data);
    fetchData();
  };

  const handleRemoveStudent = async (studentId) => {
    await api.delete(`/admin/batches/${enrollBatch.id}/students/${studentId}`);
    toast.success('Student removed');
    const [enrolled, available] = await Promise.all([
      api.get(`/admin/batches/${enrollBatch.id}/students`),
      api.get(`/admin/batches/${enrollBatch.id}/students/available`),
    ]);
    setEnrolledStudents(enrolled.data);
    setAvailableStudents(available.data);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-gray-500 text-sm">Manage class batches and student enrollment</p>
        </div>
        <button onClick={openCreate} className="btn-primary bg-admin text-white hover:bg-admin-dark flex items-center gap-2">
          <Plus size={16} /> New Batch
        </button>
      </div>

      {loading ? <SkeletonList /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map(batch => (
            <motion.div
              key={batch.id}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              className="card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{batch.name}</h3>
                  <p className="text-sm text-gray-500">{batch.subject || 'No subject'}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(batch)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(batch.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users size={14} />
                  <span>{batch.student_count} students</span>
                </div>
                <button
                  onClick={() => openEnroll(batch)}
                  className="flex items-center gap-1 text-xs text-admin font-medium hover:underline"
                >
                  <UserPlus size={12} /> Manage Students
                </button>
              </div>
              {batch.teacher_name && (
                <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                  Teacher: {batch.teacher_name}
                </p>
              )}
            </motion.div>
          ))}
          {batches.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-8">No batches yet</p>
          )}
        </div>
      )}

      {/* Create/Edit Batch Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Batch' : 'Create Batch'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input focus:ring-purple-400" placeholder="e.g. Batch A - Morning" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input focus:ring-purple-400" placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Teacher</label>
            <select value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))} className="input">
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 btn-primary bg-admin text-white hover:bg-admin-dark">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Student Enrollment Modal */}
      <Modal open={showEnrollModal} onClose={() => setShowEnrollModal(false)} title={`Manage Students — ${enrollBatch?.name}`} size="lg">
        <div className="space-y-5">
          {/* Enrolled students */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users size={14} className="text-admin" />
              Enrolled ({enrolledStudents.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {enrolledStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 bg-admin-light rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.full_name}</p>
                    <p className="text-xs text-gray-500">Roll: {s.roll_number || '—'} · {s.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(s.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
                    title="Remove from batch"
                  >
                    <UserMinus size={14} />
                  </button>
                </div>
              ))}
              {enrolledStudents.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-3">No students enrolled yet</p>
              )}
            </div>
          </div>

          {/* Available students */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <UserPlus size={14} className="text-green-600" />
              Add Students ({availableStudents.length} available)
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {availableStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.full_name}</p>
                    <p className="text-xs text-gray-500">Roll: {s.roll_number || '—'} · {s.email}</p>
                  </div>
                  <button
                    onClick={() => handleAddStudent(s.id)}
                    className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                    title="Add to batch"
                  >
                    <UserPlus size={14} />
                  </button>
                </div>
              ))}
              {availableStudents.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-3">All students are enrolled</p>
              )}
            </div>
          </div>

          <button onClick={() => setShowEnrollModal(false)} className="w-full btn-primary border border-gray-200 hover:bg-gray-50">
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
