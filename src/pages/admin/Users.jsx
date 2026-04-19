import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, RefreshCw, Search, UserPlus, Pencil, Trash2,
  ChevronDown, ChevronUp, X, Save, Loader2,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'teacher', 'parent', 'student'];

const EMPTY_FORM = { email: '', password: '', role: 'student', full_name: '', phone: '' };
const EMPTY_STU  = { roll_number: '', grade: '', batch_name: '', date_of_birth: '', parent_id: '' };

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [parents, setParents]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [creating, setCreating]     = useState(false);

  // Edit modal
  const [editUser, setEditUser]   = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [stuProfile, setStuProfile] = useState(EMPTY_STU);
  const [saving, setSaving]       = useState(false);

  // Reset
  const [resetting, setResetting] = useState(null);

  // Expanded row (student profile preview)
  const [expandedId, setExpandedId] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/admin/users', { params: { role: roleFilter || undefined } }),
      api.get('/admin/users', { params: { role: 'parent' } }),
    ]).then(([u, p]) => {
      setUsers(u.data);
      setParents(p.data);
    }).finally(() => setLoading(false));
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Create ──────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/users', createForm);
      toast.success('User created');
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      fetchUsers();
    } finally {
      setCreating(false);
    }
  };

  // ── Open Edit ───────────────────────────────────────────────
  const openEdit = async (user) => {
    setEditUser(user);
    setEditForm({ full_name: user.full_name, email: user.email, phone: user.phone || '', role: user.role });
    setStuProfile(EMPTY_STU);
    if (user.role === 'student') {
      try {
        const { data } = await api.get(`/admin/users/${user.id}/student-profile`);
        if (data) setStuProfile({
          roll_number:   data.roll_number   || '',
          grade:         data.grade         || '',
          batch_name:    data.batch_name    || '',
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          parent_id:     data.parent_id     || '',
        });
      } catch { /* no profile yet */ }
    }
  };

  // ── Save Edit ───────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/users/${editUser.id}`, editForm);
      if (editForm.role === 'student') {
        await api.put(`/admin/users/${editUser.id}/student-profile`, stuProfile);
      }
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async (user) => {
    if (!confirm(`Delete "${user.full_name}"? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${user.id}`);
    toast.success('User deleted');
    fetchUsers();
  };

  // ── Reset password ──────────────────────────────────────────
  const handleReset = async (id) => {
    setResetting(id);
    try {
      const { data } = await api.post(`/admin/reset-password/${id}`);
      toast.success(`Temp password: ${data.temp_password}`, { duration: 10000 });
    } finally {
      setResetting(null);
    }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">{filtered.length} user{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary bg-admin text-white hover:bg-admin-dark flex items-center gap-2"
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="input pl-9"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
        </div>

        {loading ? <SkeletonTable rows={8} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['', 'Name', 'Email', 'Role', 'Phone', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <>
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      {/* Expand toggle for students */}
                      <td className="py-3 px-3 w-8">
                        {user.role === 'student' && (
                          <button
                            onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                            className="p-1 rounded hover:bg-gray-200 text-gray-400"
                          >
                            {expandedId === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-admin-light text-admin flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </div>
                          {user.full_name}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{user.email}</td>
                      <td className="py-3 px-3"><Badge label={user.role} variant={user.role} /></td>
                      <td className="py-3 px-3 text-gray-500">{user.phone || '—'}</td>
                      <td className="py-3 px-3">
                        {user.force_password_change
                          ? <span className="badge bg-orange-100 text-orange-600">Must change pwd</span>
                          : <span className="badge bg-green-100 text-green-600">Active</span>
                        }
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => openEdit(user)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          <button
                            onClick={() => handleReset(user.id)}
                            disabled={resetting === user.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                          >
                            <RefreshCw size={11} className={resetting === user.id ? 'animate-spin' : ''} />
                            Reset Pwd
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expandable student profile row */}
                    <AnimatePresence>
                      {expandedId === user.id && (
                        <motion.tr
                          key={`${user.id}-expand`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={7} className="px-3 pb-3">
                            <StudentProfilePreview userId={user.id} parents={parents} />
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-10">No users found</p>
            )}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required value={createForm.full_name}
                onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))}
                className="input focus:ring-purple-400" placeholder="e.g. Aarav Sharma" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={createForm.email}
                onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                className="input focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={createForm.password}
                onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                className="input focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={createForm.phone}
                onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                className="input focus:ring-purple-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={createForm.role}
                onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}
                className="input">
                {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={creating} className="flex-1 btn-primary bg-admin text-white hover:bg-admin-dark flex items-center justify-center gap-2">
              {creating && <Loader2 size={14} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit — ${editUser?.full_name}`} size="lg">
        {editUser && (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Basic info */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account Info</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required value={editForm.full_name}
                    onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                    className="input focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={editForm.email}
                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    className="input focus:ring-purple-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={editForm.phone}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    className="input focus:ring-purple-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={editForm.role}
                    onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                    className="input">
                    {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Student profile section */}
            {editForm.role === 'student' && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Student Profile</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                    <input value={stuProfile.roll_number}
                      onChange={e => setStuProfile(p => ({ ...p, roll_number: e.target.value }))}
                      className="input focus:ring-purple-400" placeholder="e.g. ROLL001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                    <input value={stuProfile.grade}
                      onChange={e => setStuProfile(p => ({ ...p, grade: e.target.value }))}
                      className="input focus:ring-purple-400" placeholder="e.g. 10th" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                    <input value={stuProfile.batch_name}
                      onChange={e => setStuProfile(p => ({ ...p, batch_name: e.target.value }))}
                      className="input focus:ring-purple-400" placeholder="e.g. Batch A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" value={stuProfile.date_of_birth}
                      onChange={e => setStuProfile(p => ({ ...p, date_of_birth: e.target.value }))}
                      className="input focus:ring-purple-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
                    <select value={stuProfile.parent_id}
                      onChange={e => setStuProfile(p => ({ ...p, parent_id: e.target.value }))}
                      className="input">
                      <option value="">— Select parent —</option>
                      {parents.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2">
                <X size={14} /> Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary bg-admin text-white hover:bg-admin-dark flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

// ── Inline student profile preview (expandable row) ──────────
function StudentProfilePreview({ userId, parents }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get(`/admin/users/${userId}/student-profile`)
      .then(r => setProfile(r.data))
      .catch(() => {});
  }, [userId]);

  if (!profile) return (
    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-400">No student profile yet. Click Edit to add one.</div>
  );

  const parentName = parents.find(p => p.id === profile.parent_id)?.full_name;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-admin-light rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm"
    >
      {[
        { label: 'Roll No',    value: profile.roll_number  || '—' },
        { label: 'Grade',      value: profile.grade        || '—' },
        { label: 'Batch',      value: profile.batch_name   || '—' },
        { label: 'Parent',     value: parentName           || '—' },
        { label: 'DOB',        value: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '—' },
        { label: 'Enrolled',   value: profile.enrollment_date ? profile.enrollment_date.split('T')[0] : '—' },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="font-medium text-gray-800">{value}</p>
        </div>
      ))}
    </motion.div>
  );
}
