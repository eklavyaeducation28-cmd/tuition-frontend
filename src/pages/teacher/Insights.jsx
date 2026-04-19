import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, UserX, Trophy } from 'lucide-react';
import api from '../../utils/api';
import { SkeletonList } from '../../components/common/SkeletonLoader';

export default function TeacherInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/insights').then(r => setInsights(r.data)).finally(() => setLoading(false));
  }, []);

  const drops = insights.filter(i => i.type === 'drop');
  const attendance = insights.filter(i => i.type === 'attendance');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-500 text-sm">Automated alerts and performance analysis</p>
      </div>

      {loading ? <SkeletonList /> : (
        <>
          {insights.length === 0 && (
            <div className="card text-center py-12">
              <Trophy size={40} className="mx-auto text-yellow-400 mb-3" />
              <p className="font-semibold text-gray-700">All students are performing well!</p>
              <p className="text-sm text-gray-400 mt-1">No alerts at this time</p>
            </div>
          )}

          {drops.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-100 rounded-xl">
                  <TrendingDown size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Performance Drop Alerts</h3>
                  <p className="text-xs text-gray-500">Students with &gt;20% drop in last 3 tests</p>
                </div>
              </div>
              <div className="space-y-2">
                {drops.map((d, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="font-medium text-sm text-gray-900">{d.full_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{parseFloat(d.oldest).toFixed(1)}% → {parseFloat(d.latest).toFixed(1)}%</p>
                      <p className="text-xs text-red-600 font-medium">↓ {parseFloat(d.drop_pct).toFixed(1)}% drop</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {attendance.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <UserX size={18} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Low Attendance Alerts</h3>
                  <p className="text-xs text-gray-500">Students with attendance below 75%</p>
                </div>
              </div>
              <div className="space-y-2">
                {attendance.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <span className="font-medium text-sm text-gray-900">{a.full_name}</span>
                    <span className="text-sm font-semibold text-orange-600">{a.attendance_pct}% attendance</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
