import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import { ProgressLineChart } from '../../components/common/Charts';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import api from '../../utils/api';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/marks').then(r => setMarks(r.data)).finally(() => setLoading(false));
  }, []);

  // marks come ASC from API — deduplicate by test_id
  const uniqueMarks = useMemo(() => {
    const seen = new Set();
    return marks.filter(m => {
      if (seen.has(m.test_id)) return false;
      seen.add(m.test_id);
      return true;
    });
  }, [marks]);

  // Chart uses ASC order (oldest → newest)
  const chartLabels = uniqueMarks.slice(-8).map(m => m.test_name?.slice(0, 10) || '');
  const chartData   = uniqueMarks.slice(-8).map(m => parseFloat(m.percentage  || 0));
  const avgData     = uniqueMarks.slice(-8).map(m => parseFloat(m.class_avg   || 0));

  // Table shows newest first
  const tableMarks = [...uniqueMarks].reverse();

  const getTrend = (idx) => {
    if (idx >= tableMarks.length - 1) return null;
    const curr = parseFloat(tableMarks[idx].percentage);
    const prev = parseFloat(tableMarks[idx + 1].percentage);
    if (curr > prev) return 'up';
    if (curr < prev) return 'down';
    return 'same';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Marks</h1>
        <p className="text-gray-500 text-sm">Test scores and performance</p>
      </div>

      {uniqueMarks.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Performance Trend</h3>
          <ProgressLineChart
            labels={chartLabels}
            studentData={chartData}
            avgData={avgData}
            color="#F59E0B"
          />
        </div>
      )}

      {loading ? <SkeletonList /> : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Test', 'Subject', 'Date', 'Marks', '%', 'Class Avg', 'Trend', 'Remarks', 'Answer Sheet'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableMarks.map((m, i) => {
                  const pct   = parseFloat(m.percentage || 0);
                  const trend = getTrend(i);
                  return (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-3 font-medium">{m.test_name}</td>
                      <td className="py-3 px-3 text-gray-500">{m.subject}</td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{m.test_date?.split('T')[0]}</td>
                      <td className="py-3 px-3">{m.marks_obtained}/{m.total_marks}</td>
                      <td className="py-3 px-3">
                        <span className={`font-semibold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{parseFloat(m.class_avg || 0).toFixed(1)}%</td>
                      <td className="py-3 px-3">
                        {trend === 'up'   && <TrendingUp   size={14} className="text-green-500" />}
                        {trend === 'down' && <TrendingDown size={14} className="text-red-500"   />}
                        {trend === 'same' && <Minus        size={14} className="text-gray-400"  />}
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-xs">{m.remarks || '—'}</td>
                      <td className="py-3 px-3">
                        {m.answer_sheet_url ? (
                          <a href={toAbsoluteUrl(m.answer_sheet_url)} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-green-600 hover:underline text-xs">
                            <FileText size={12} /> View
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {uniqueMarks.length === 0 && (
              <p className="text-center text-gray-400 py-8">No marks available yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
