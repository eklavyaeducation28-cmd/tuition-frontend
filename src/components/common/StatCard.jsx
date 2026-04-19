import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function AnimatedNumber({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, Number(value) || 0, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

const colorMap = {
  purple: { bg: 'bg-admin-light text-admin', ring: 'hover:ring-admin/20' },
  blue:   { bg: 'bg-teacher-light text-teacher', ring: 'hover:ring-teacher/20' },
  green:  { bg: 'bg-parent-light text-parent', ring: 'hover:ring-parent/20' },
  orange: { bg: 'bg-student-light text-student', ring: 'hover:ring-student/20' },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', suffix = '', trend, to }) {
  const { bg, ring } = colorMap[color] || colorMap.blue;

  const inner = (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      className={`card flex items-center gap-4 cursor-pointer ring-2 ring-transparent transition-all duration-200 ${to ? ring : ''}`}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${bg}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          <AnimatedNumber value={value} />{suffix}
        </p>
        {trend && (
          <p className={`text-xs mt-0.5 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
      {to && (
        <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
      )}
    </motion.div>
  );

  if (to) {
    return <Link to={to} className="block">{inner}</Link>;
  }
  return inner;
}
