import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ProgressLineChart, SubjectRadarChart } from '../../components/common/Charts';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import api from '../../utils/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function ParentMarks() {
  const [children, setChildren] = useState([]);
  const [marks, setMarks] = useState([]);
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
    api.get('/parent/marks', { params: { student_id: selectedChild.id } })
      .then(r => setMarks(r.data))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const getTrend = (idx) => {
    if (idx >= marks.length - 1) return null;
    const curr = parseFloat(marks[idx].percentage);
    const prev = parseFloat(marks[idx + 1].percentage);
    if (curr > prev) return 'up';
    if (curr < prev) return 'down';
    return 'same';
  };

  const chartLabels = [...marks].reverse().map(m => m.test_name?.slice(0, 10));
  const chartData = [...marks].reverse().map(m => parseFloat(m.percentage || 0));
  const avgData = [...marks].reverse().map(m => parseFloat(m.class_avg || 0));

  // Subject radar
  const subjectMap = {};
  marks.forEach(m => {
    if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
    subjectMap[m.subject].push(parseFloat(m.percentage || 0));
  });
  const radarLabels = Object.keys(subjectMap);
  const radarData = radarLabels.map(s => {
    const arr = subjectMap[s];
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks</h1>
          <p className="text-gray-500 text-sm">Test scores and performance</p>
        </div>
        {children.length > 1 && (
          <select value={selectedChild?.id || ''} onChange={e => setSelectedChild(children.find(c => c.id === e.target.value))} className="input w-auto">
            {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        )}
      </div>

      {marks.length > 1 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Progress Over Time</h3>
            <ProgressLineChart labels={chartLabels} studentData={chartData} avgData={avgData} color="#10B981" />
          </div>
          {radarLabels.length > 2 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Subject Strengths</h3>
              <SubjectRadarChart labels={radarLabels} data={radarData} color="#10B981" />
            </div>
          )}
        </div>
      )}

      {loading ? <SkeletonList /> : (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">All Tests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Test', 'Batch', 'Date', 'Marks', 'Percentage', 'Class Avg', 'Trend', 'Paper'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marks.map((m, i) => {
                  const trend = getTrend(i);
                  const pct = parseFloat(m.percentage || 0);
                  return (
                    <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{m.test_name}</td>
                      <td className="py-3 px-2 text-gray-500">{m.batch_name}</td>
                      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">{m.test_date?.split('T')[0]}</td>
                      <td className="py-3 px-2">{m.marks_obtained}/{m.total_marks}</td>
                      <td className="py-3 px-2">
                        <span className={`font-semibold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{parseFloat(m.class_avg || 0).toFixed(1)}%</td>
                      <td className="py-3 px-2">
                        {trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                        {trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                        {trend === 'same' && <Minus size={14} className="text-gray-400" />}
                      </td>
                      <td className="py-3 px-2">
                        {m.question_paper_url && (
                          <a href={toAbsoluteUrl(m.question_paper_url)} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:underline text-xs">
                            <FileText size={12} /> View
                          </a>
                        )}
                        {m.answer_sheet_url && (
                          <a href={toAbsoluteUrl(m.answer_sheet_url)} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-green-500 hover:underline text-xs mt-0.5">
                            <FileText size={12} /> Answer
                          </a>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {marks.length === 0 && <p className="text-center text-gray-400 py-8">No marks available</p>}
          </div>
        </div>
      )}
    </div>
  );
}
