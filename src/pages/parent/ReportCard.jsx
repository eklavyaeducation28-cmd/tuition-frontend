import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, GraduationCap, Award, Calendar, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import { generateReportCard } from '../../utils/reportCard';
import toast from 'react-hot-toast';

export default function ParentReportCard() {
  const [children, setChildren] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/parent/children').then(r => {
      setChildren(r.data);
      if (r.data[0]) setSelectedChild(r.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    api.get('/parent/report-card', { params: { student_id: selectedChild.id } })
      .then(r => setReportData(r.data))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await generateReportCard('report-card-content', `report-card-${selectedChild?.full_name}.pdf`);
      toast.success('Report card downloaded');
    } finally {
      setGenerating(false);
    }
  };

  const avgPct = reportData?.marks?.length
    ? (reportData.marks.reduce((s, m) => s + parseFloat(m.percentage || 0), 0) / reportData.marks.length).toFixed(1)
    : 0;

  const attendancePct = reportData?.attendance?.total
    ? ((reportData.attendance.present / reportData.attendance.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Card</h1>
          <p className="text-gray-500 text-sm">Download digital report card</p>
        </div>
        <div className="flex items-center gap-3">
          {children.length > 1 && (
            <select value={selectedChild?.id || ''} onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))} className="input w-auto">
              {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          )}
          <button onClick={handleDownload} disabled={generating || !reportData}
            className="btn-primary bg-parent text-white hover:bg-parent-dark flex items-center gap-2">
            <Download size={16} />
            {generating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-8 rounded-xl" />)}
        </div>
      ) : reportData ? (
        <div id="report-card-content" className="card space-y-6 bg-white">
          {/* Header */}
          <div className="text-center border-b border-gray-100 pb-6">
            <div className="flex justify-center mb-3">
              <div className="p-4 bg-parent-light rounded-2xl">
                <GraduationCap size={36} className="text-parent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">EduPortal</h2>
            <p className="text-gray-500">Student Progress Report</p>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Student Name</p>
              <p className="font-semibold text-gray-900">{reportData.student?.full_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Roll Number</p>
              <p className="font-semibold text-gray-900">{reportData.student?.roll_number || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Grade</p>
              <p className="font-semibold text-gray-900">{reportData.student?.grade || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Batch</p>
              <p className="font-semibold text-gray-900">{reportData.student?.batch_name || '—'}</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-parent-light rounded-xl p-3 text-center">
              <TrendingUp size={18} className="text-parent mx-auto mb-1" />
              <p className="text-xl font-bold text-parent">{avgPct}%</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Calendar size={18} className="text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-blue-600">{attendancePct}%</p>
              <p className="text-xs text-gray-500">Attendance</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <Award size={18} className="text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-yellow-600">#{reportData.rank?.rank || '—'}</p>
              <p className="text-xs text-gray-500">Class Rank</p>
            </div>
          </div>

          {/* Marks table */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Test Scores</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 rounded-xl">
                  <th className="text-left py-2 px-3 text-gray-500">Test</th>
                  <th className="text-left py-2 px-3 text-gray-500">Subject</th>
                  <th className="text-left py-2 px-3 text-gray-500">Marks</th>
                  <th className="text-left py-2 px-3 text-gray-500">%</th>
                  <th className="text-left py-2 px-3 text-gray-500">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {reportData.marks?.map(m => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="py-2 px-3">{m.test_name}</td>
                    <td className="py-2 px-3 text-gray-500">{m.subject}</td>
                    <td className="py-2 px-3">{m.marks_obtained}/{m.total_marks}</td>
                    <td className="py-2 px-3">
                      <span className={`font-semibold ${parseFloat(m.percentage) >= 75 ? 'text-green-600' : parseFloat(m.percentage) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {parseFloat(m.percentage).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{m.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attendance summary */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Attendance Summary</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {[
                { label: 'Total', value: reportData.attendance?.total, color: 'bg-gray-100' },
                { label: 'Present', value: reportData.attendance?.present, color: 'bg-green-100' },
                { label: 'Absent', value: reportData.attendance?.absent, color: 'bg-red-100' },
                { label: 'Late', value: reportData.attendance?.late, color: 'bg-yellow-100' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-2`}>
                  <p className="font-bold text-gray-900">{s.value || 0}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">Select a child to view report card</p>
      )}
    </div>
  );
}
