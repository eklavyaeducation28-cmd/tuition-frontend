import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Upload, Table, Image, Download, FileText,
  Paperclip, Pencil, CheckCircle, Loader2, Settings, Trash2,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import api from '../../utils/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Ensure URL is always absolute — fixes old relative /uploads/... records
const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url.startsWith('/') ? '' : '/'}${url}`;
};
import toast from 'react-hot-toast';

const UPLOAD_METHODS = [
  { id: 'manual', label: 'Manual Entry',    icon: Table,  desc: 'Enter / edit marks per student' },
  { id: 'bulk',   label: 'Excel/CSV Upload', icon: Upload, desc: 'Bulk upload via spreadsheet'    },
  { id: 'image',  label: 'Image Upload',     icon: Image,  desc: 'Photo of marks register'        },
];

export default function TeacherTests() {
  const [batches, setBatches]   = useState([]);
  const [tests, setTests]       = useState([]);
  const [loading, setLoading]   = useState(true);

  // Create test
  const [showTestModal, setShowTestModal] = useState(false);
  const [testForm, setTestForm] = useState({ batch_id: '', test_name: '', test_date: '', total_marks: '', description: '' });
  const [qpFile, setQpFile]     = useState(null);
  const [creating, setCreating] = useState(false);

  // Marks modal
  const [showMarksModal, setShowMarksModal]   = useState(false);
  const [selectedTest, setSelectedTest]       = useState(null);
  const [uploadMethod, setUploadMethod]       = useState('manual');
  const [students, setStudents]               = useState([]);
  const [manualMarks, setManualMarks]         = useState([]);   // { student_id, marks_obtained, remarks, existing }
  const [bulkFile, setBulkFile]               = useState(null);
  const [imageFile, setImageFile]             = useState(null);
  const [submitting, setSubmitting]           = useState(false);

  // Answer sheets
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerTest, setAnswerTest]           = useState(null);
  const [testMarks, setTestMarks]             = useState([]);
  const [answerFiles, setAnswerFiles]         = useState({});

  // Edit test
  const [showEditModal, setShowEditModal]   = useState(false);
  const [editingTest, setEditingTest]       = useState(null);
  const [editForm, setEditForm]             = useState({ test_name: '', test_date: '', total_marks: '', description: '' });
  const [editQpFile, setEditQpFile]         = useState(null);
  const [editSaving, setEditSaving]         = useState(false);

  // Delete test
  const [confirmDelete, setConfirmDelete]   = useState(null); // holds test object

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/teacher/batches'), api.get('/teacher/tests')])
      .then(([b, t]) => { setBatches(b.data); setTests(t.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // ── Open marks modal — pre-fill existing marks ──────────────
  const openMarks = async (test) => {
    setSelectedTest(test);
    setUploadMethod('manual');
    setBulkFile(null);
    setImageFile(null);

    // Load students + any existing marks in parallel
    const [stuRes, markRes] = await Promise.all([
      api.get(`/teacher/batches/${test.batch_id}/students`),
      api.get(`/teacher/tests/${test.id}/marks`),
    ]);

    const stuList = stuRes.data;
    const existingMap = {};
    markRes.data.forEach(m => {
      existingMap[m.student_id] = { marks_obtained: String(m.marks_obtained ?? ''), remarks: m.remarks || '' };
    });

    setStudents(stuList);
    setManualMarks(stuList.map(s => ({
      student_id:     s.id,
      marks_obtained: existingMap[s.id]?.marks_obtained ?? '',
      remarks:        existingMap[s.id]?.remarks        ?? '',
      existing:       !!existingMap[s.id],   // flag to show "saved" indicator
    })));
    setShowMarksModal(true);
  };

  // ── Create test ─────────────────────────────────────────────
  const handleCreateTest = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const fd = new FormData();
      Object.entries(testForm).forEach(([k, v]) => v && fd.append(k, v));
      if (qpFile) fd.append('question_paper', qpFile);
      await api.post('/teacher/tests', fd);
      toast.success('Test created');
      setShowTestModal(false);
      setTestForm({ batch_id: '', test_name: '', test_date: '', total_marks: '', description: '' });
      setQpFile(null);
      fetchData();
    } finally {
      setCreating(false);
    }
  };

  // ── Submit marks ─────────────────────────────────────────────
  const handleSubmitMarks = async () => {
    setSubmitting(true);
    try {
      if (uploadMethod === 'manual') {
        const valid = manualMarks.filter(m => m.marks_obtained !== '');
        if (!valid.length) return toast.error('Enter at least one mark');
        await api.post('/teacher/marks/manual', { test_id: selectedTest.id, marks_data: valid });
        toast.success(`${valid.length} marks saved`);
      } else if (uploadMethod === 'bulk') {
        if (!bulkFile) return toast.error('Select a file');
        const fd = new FormData();
        fd.append('test_id', selectedTest.id);
        fd.append('file', bulkFile);
        const { data } = await api.post('/teacher/marks/bulk', fd);
        toast.success(`Bulk upload: ${data.count} records saved`);
      } else {
        if (!imageFile) return toast.error('Select an image');
        const fd = new FormData();
        fd.append('test_id', selectedTest.id);
        fd.append('image', imageFile);
        await api.post('/teacher/marks/image', fd);
        toast.success('Image uploaded');
      }
      setShowMarksModal(false);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Answer sheets ────────────────────────────────────────────
  const openAnswerSheets = async (test) => {
    setAnswerTest(test);
    const { data } = await api.get(`/teacher/tests/${test.id}/marks`);
    setTestMarks(data);
    setAnswerFiles({});
    setShowAnswerModal(true);
  };

  const handleUploadAnswerSheet = async (studentId) => {
    const file = answerFiles[studentId];
    if (!file) return toast.error('Select a file first');
    const fd = new FormData();
    fd.append('test_id', answerTest.id);
    fd.append('student_id', studentId);
    fd.append('file', file);
    await api.post('/teacher/marks/answer-sheet', fd);
    toast.success('Answer sheet uploaded');
    const { data } = await api.get(`/teacher/tests/${answerTest.id}/marks`);
    setTestMarks(data);
    setAnswerFiles(p => { const n = { ...p }; delete n[studentId]; return n; });
  };

  // ── Edit test ────────────────────────────────────────────────
  const openEdit = (test) => {
    setEditingTest(test);
    setEditForm({
      test_name:   test.test_name,
      test_date:   test.test_date?.split('T')[0],
      total_marks: String(test.total_marks),
      description: test.description || '',
    });
    setEditQpFile(null);
    setShowEditModal(true);
  };

  const handleEditTest = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      if (editQpFile) fd.append('question_paper', editQpFile);
      await api.put(`/teacher/tests/${editingTest.id}`, fd);
      toast.success('Test updated');
      setShowEditModal(false);
      fetchData();
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteTest = async () => {
    try {
      await api.delete(`/teacher/tests/${confirmDelete.id}`);
      toast.success('Test deleted');
      setConfirmDelete(null);
      fetchData();
    } catch {
      setConfirmDelete(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const { data } = await api.get('/teacher/marks/template', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'marks_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const updateMark = (idx, field, value) =>
    setManualMarks(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));

  const fillAll = (value) =>
    setManualMarks(prev => prev.map(m => ({ ...m, marks_obtained: String(value) })));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests & Marks</h1>
          <p className="text-gray-500 text-sm">Create tests, enter and edit marks</p>
        </div>
        <button
          onClick={() => setShowTestModal(true)}
          className="btn-primary bg-teacher text-white hover:bg-teacher-dark flex items-center gap-2"
        >
          <Plus size={16} /> New Test
        </button>
      </div>

      {/* Test list */}
      {loading ? <SkeletonList /> : (
        <div className="space-y-3">
          {tests.map(test => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{test.test_name}</h3>
                  <p className="text-sm text-gray-500">
                    {test.batch_name} · {test.test_date?.split('T')[0]} · {test.total_marks} marks
                  </p>
                  {test.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{test.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {test.question_paper_url && (
                    <a href={toAbsoluteUrl(test.question_paper_url)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                      <FileText size={12} /> Paper
                    </a>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    Number(test.marks_entered) > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {test.marks_entered} / {test.marks_entered > 0 ? '✓' : '—'} marks
                  </span>
                  <button
                    onClick={() => openEdit(test)}
                    className="btn-primary border border-gray-200 text-gray-600 text-xs px-3 py-1.5 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <Settings size={11} /> Edit
                  </button>
                  <button
                    onClick={() => openMarks(test)}
                    className="btn-primary bg-teacher text-white text-xs px-3 py-1.5 hover:bg-teacher-dark flex items-center gap-1"
                  >
                    <Pencil size={11} />
                    {Number(test.marks_entered) > 0 ? 'Edit Marks' : 'Enter Marks'}
                  </button>
                  <button
                    onClick={() => openAnswerSheets(test)}
                    className="btn-primary border border-teacher text-teacher text-xs px-3 py-1.5 hover:bg-teacher-light"
                  >
                    Answer Sheets
                  </button>
                  <button
                    onClick={() => setConfirmDelete(test)}
                    className="btn-primary border border-red-200 text-red-500 text-xs px-3 py-1.5 hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {tests.length === 0 && (
            <p className="text-center text-gray-400 py-8">No tests yet. Create one above.</p>
          )}
        </div>
      )}

      {/* ── Create Test Modal ── */}
      <Modal open={showTestModal} onClose={() => setShowTestModal(false)} title="Create New Test">
        <form onSubmit={handleCreateTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
            <select required value={testForm.batch_id}
              onChange={e => setTestForm(p => ({ ...p, batch_id: e.target.value }))} className="input">
              <option value="">Select batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
            <input required value={testForm.test_name}
              onChange={e => setTestForm(p => ({ ...p, test_name: e.target.value }))}
              className="input focus:ring-blue-400" placeholder="e.g. Unit Test 1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required value={testForm.test_date}
                onChange={e => setTestForm(p => ({ ...p, test_date: e.target.value }))}
                className="input focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input type="number" required min="1" value={testForm.total_marks}
                onChange={e => setTestForm(p => ({ ...p, total_marks: e.target.value }))}
                className="input focus:ring-blue-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={testForm.description}
              onChange={e => setTestForm(p => ({ ...p, description: e.target.value }))}
              className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Paper (PDF, optional)</label>
            <input type="file" accept=".pdf" onChange={e => setQpFile(e.target.files[0])} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTestModal(false)}
              className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={creating}
              className="flex-1 btn-primary bg-teacher text-white hover:bg-teacher-dark flex items-center justify-center gap-2">
              {creating && <Loader2 size={14} className="animate-spin" />}
              Create Test
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Marks Modal ── */}
      <Modal
        open={showMarksModal}
        onClose={() => setShowMarksModal(false)}
        title={`${Number(selectedTest?.marks_entered) > 0 ? 'Edit' : 'Enter'} Marks — ${selectedTest?.test_name}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Method tabs */}
          <div className="grid grid-cols-3 gap-2">
            {UPLOAD_METHODS.map(m => (
              <button key={m.id} onClick={() => setUploadMethod(m.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  uploadMethod === m.id
                    ? 'border-teacher bg-teacher-light'
                    : 'border-gray-100 hover:border-gray-200'
                }`}>
                <m.icon size={15} className={uploadMethod === m.id ? 'text-teacher' : 'text-gray-400'} />
                <p className="text-xs font-semibold mt-1">{m.label}</p>
                <p className="text-xs text-gray-400 leading-tight">{m.desc}</p>
              </button>
            ))}
          </div>

          {/* ── Manual entry table ── */}
          {uploadMethod === 'manual' && (
            <>
              {/* Quick-fill bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Quick fill all:</span>
                {[100, 90, 80, 70, 60, 50].map(v => (
                  <button key={v} onClick={() => fillAll(v)}
                    className="px-2 py-0.5 rounded-lg text-xs bg-gray-100 hover:bg-teacher-light hover:text-teacher transition-colors">
                    {v}
                  </button>
                ))}
                <button onClick={() => fillAll('')}
                  className="px-2 py-0.5 rounded-lg text-xs bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors">
                  Clear all
                </button>
              </div>

              <div className="overflow-auto max-h-72 rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
                    <tr>
                      <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Student</th>
                      <th className="text-left py-2.5 px-3 text-gray-500 font-medium w-32">
                        Marks <span className="text-gray-400 font-normal">/ {selectedTest?.total_marks}</span>
                      </th>
                      <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Remarks</th>
                      <th className="py-2.5 px-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const m = manualMarks[i] || {};
                      const pct = m.marks_obtained !== ''
                        ? ((parseFloat(m.marks_obtained) / selectedTest?.total_marks) * 100).toFixed(1)
                        : null;
                      return (
                        <tr key={s.id} className={`border-b border-gray-50 ${m.existing ? 'bg-blue-50/30' : ''}`}>
                          <td className="py-2 px-3">
                            <p className="font-medium text-gray-900">{s.full_name}</p>
                            <p className="text-xs text-gray-400">Roll: {s.roll_number}</p>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max={selectedTest?.total_marks}
                                value={m.marks_obtained}
                                onChange={e => updateMark(i, 'marks_obtained', e.target.value)}
                                className={`input py-1 text-sm w-20 ${
                                  pct !== null
                                    ? parseFloat(pct) >= 75
                                      ? 'border-green-300 focus:ring-green-400'
                                      : parseFloat(pct) >= 50
                                        ? 'border-yellow-300 focus:ring-yellow-400'
                                        : 'border-red-300 focus:ring-red-400'
                                    : ''
                                }`}
                                placeholder="—"
                              />
                              {pct !== null && (
                                <span className={`text-xs font-medium ${
                                  parseFloat(pct) >= 75 ? 'text-green-600'
                                  : parseFloat(pct) >= 50 ? 'text-yellow-600'
                                  : 'text-red-600'
                                }`}>
                                  {pct}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              value={m.remarks}
                              onChange={e => updateMark(i, 'remarks', e.target.value)}
                              className="input py-1 text-sm"
                              placeholder="Optional"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            {m.existing && (
                              <CheckCircle size={14} className="text-blue-400 mx-auto" title="Previously saved" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle size={11} className="text-blue-400" /> Previously saved (will be updated)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> ≥75%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 50–74%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &lt;50%
                </span>
              </div>
            </>
          )}

          {/* ── Bulk upload ── */}
          {uploadMethod === 'bulk' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                Download the template, fill in roll numbers and marks, then upload. Existing marks will be overwritten.
              </div>
              <button onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-blue-500 hover:underline">
                <Download size={14} /> Download Template (XLSX)
              </button>
              <input type="file" accept=".xlsx,.csv,.xls"
                onChange={e => setBulkFile(e.target.files[0])} className="input" />
            </div>
          )}

          {/* ── Image upload ── */}
          {uploadMethod === 'image' && (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-xl text-sm text-yellow-700">
                Upload a photo of the marks register. Marks will need to be entered manually afterwards.
              </div>
              <input type="file" accept="image/*"
                onChange={e => setImageFile(e.target.files[0])} className="input" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowMarksModal(false)}
              className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSubmitMarks} disabled={submitting}
              className="flex-1 btn-primary bg-teacher text-white hover:bg-teacher-dark flex items-center justify-center gap-2">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Save Marks
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Answer Sheets Modal ── */}
      <Modal
        open={showAnswerModal}
        onClose={() => setShowAnswerModal(false)}
        title={`Answer Sheets — ${answerTest?.test_name}`}
        size="lg"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Upload scanned answer sheets per student. Marks must be entered first.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testMarks.map(m => (
              <div key={m.student_id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.full_name}</p>
                    <p className="text-xs text-gray-500">
                      Roll: {m.roll_number} · Score: {m.marks_obtained}/{answerTest?.total_marks}
                    </p>
                  </div>
                  {m.answer_sheet_url && (
                    <a href={toAbsoluteUrl(m.answer_sheet_url)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                      <Paperclip size={11} /> View
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="file" accept=".pdf,image/*"
                    onChange={e => setAnswerFiles(p => ({ ...p, [m.student_id]: e.target.files[0] }))}
                    className="input text-xs py-1 flex-1" />
                  <button
                    onClick={() => handleUploadAnswerSheet(m.student_id)}
                    disabled={!answerFiles[m.student_id]}
                    className="btn-primary bg-teacher text-white text-xs px-3 py-1.5 hover:bg-teacher-dark disabled:opacity-40"
                  >
                    Upload
                  </button>
                </div>
              </div>
            ))}
            {testMarks.length === 0 && (
              <p className="text-center text-gray-400 py-6">
                No marks entered yet. Enter marks first.
              </p>
            )}
          </div>
          <button onClick={() => setShowAnswerModal(false)}
            className="w-full btn-primary border border-gray-200 hover:bg-gray-50">
            Close
          </button>
        </div>
      </Modal>
      {/* ── Edit Test Modal ── */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Test">
        <form onSubmit={handleEditTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
            <input required value={editForm.test_name}
              onChange={e => setEditForm(p => ({ ...p, test_name: e.target.value }))}
              className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required value={editForm.test_date}
                onChange={e => setEditForm(p => ({ ...p, test_date: e.target.value }))}
                className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input type="number" required min="1" value={editForm.total_marks}
                onChange={e => setEditForm(p => ({ ...p, total_marks: e.target.value }))}
                className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={editForm.description}
              onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
              className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replace Question Paper (PDF, optional)</label>
            {editingTest?.question_paper_url && (
              <a href={toAbsoluteUrl(editingTest.question_paper_url)} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs text-blue-500 hover:underline mb-1">
                <FileText size={11} /> Current paper
              </a>
            )}
            <input type="file" accept=".pdf" onChange={e => setEditQpFile(e.target.files[0])} className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditModal(false)}
              className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={editSaving}
              className="flex-1 btn-primary bg-teacher text-white hover:bg-teacher-dark flex items-center justify-center gap-2">
              {editSaving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
      {/* ── Confirm Delete Modal ── */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Test">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{confirmDelete?.test_name}</span>?
            This will also delete all marks and answer sheets for this test.
          </p>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setConfirmDelete(null)}
              className="flex-1 btn-primary border border-gray-200 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleDeleteTest}
              className="flex-1 btn-primary bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
