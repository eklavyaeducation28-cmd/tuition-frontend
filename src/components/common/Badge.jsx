const variants = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  open: 'bg-blue-100 text-blue-700',
  replied: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  admin: 'bg-purple-100 text-purple-700',
  teacher: 'bg-blue-100 text-blue-700',
  parent: 'bg-green-100 text-green-700',
  student: 'bg-orange-100 text-orange-700',
};

export default function Badge({ label, variant }) {
  return (
    <span className={`badge ${variants[variant] || variants[label?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}
