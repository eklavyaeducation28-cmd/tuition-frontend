import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Mail, Phone, BookOpen, Hash, Calendar } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/student/profile').then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, []);

  const fields = profile ? [
    { icon: UserCircle, label: 'Full Name', value: profile.full_name },
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Phone, label: 'Phone', value: profile.phone || '—' },
    { icon: Hash, label: 'Roll Number', value: profile.roll_number || '—' },
    { icon: BookOpen, label: 'Grade', value: profile.grade || '—' },
    { icon: BookOpen, label: 'Batch', value: profile.batch_name || '—' },
    { icon: Calendar, label: 'Enrollment Date', value: profile.enrollment_date ? new Date(profile.enrollment_date).toLocaleDateString() : '—' },
    { icon: Calendar, label: 'Date of Birth', value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : '—' },
  ] : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm">Your account information</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : profile ? (
        <>
          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card flex items-center gap-5 bg-gradient-to-r from-student-light to-white"
          >
            <div className="w-16 h-16 rounded-2xl bg-student flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{profile.full_name}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.role} · {profile.grade || 'N/A'}</p>
              <span className="badge bg-student-light text-student mt-1">Roll: {profile.roll_number || 'N/A'}</span>
            </div>
          </motion.div>

          {/* Details grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(({ icon: Icon, label, value }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card flex items-center gap-3"
              >
                <div className="p-2 bg-student-light rounded-xl flex-shrink-0">
                  <Icon size={16} className="text-student" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <UserCircle size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No profile found. Contact your admin.</p>
        </div>
      )}
    </div>
  );
}
