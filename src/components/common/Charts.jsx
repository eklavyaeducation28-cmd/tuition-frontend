import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Register once at module level — never inside a component
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, ArcElement, Filler, Tooltip, Legend
);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
  },
  animation: { duration: 900, easing: 'easeInOutQuart' },
};

export function ProgressLineChart({ labels, studentData, avgData, color = '#3B82F6' }) {
  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Your Score',
        data: studentData,
        borderColor: color,
        backgroundColor: color + '22',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2,
      },
      {
        label: 'Class Average',
        data: avgData,
        borderColor: '#94A3B8',
        backgroundColor: '#94A3B822',
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 4,
        borderWidth: 2,
      },
    ],
  }), [labels, studentData, avgData, color]);

  const options = useMemo(() => ({
    ...baseOptions,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: '#f1f5f9' },
      },
      x: { grid: { display: false } },
    },
  }), []);

  if (!labels?.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        Not enough data to show chart
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64">
      <Line data={data} options={options} />
    </motion.div>
  );
}

export function BatchBarChart({ labels, data: rawData, color = '#8B5CF6' }) {
  const data = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Average Score (%)',
      data: rawData,
      backgroundColor: color + 'CC',
      borderColor: color,
      borderWidth: 2,
      borderRadius: 8,
    }],
  }), [labels, rawData, color]);

  const options = useMemo(() => ({
    ...baseOptions,
    scales: {
      y: { min: 0, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  }), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64">
      <Bar data={data} options={options} />
    </motion.div>
  );
}

export function SubjectRadarChart({ labels, data: rawData, color = '#10B981' }) {
  const data = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Performance',
      data: rawData,
      backgroundColor: color + '30',
      borderColor: color,
      pointBackgroundColor: color,
      pointRadius: 4,
    }],
  }), [labels, rawData, color]);

  const options = useMemo(() => ({
    ...baseOptions,
    scales: { r: { min: 0, max: 100, ticks: { stepSize: 25 } } },
  }), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64">
      <Radar data={data} options={options} />
    </motion.div>
  );
}
