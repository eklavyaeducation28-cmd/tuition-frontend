import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) return toast.error('Passwords do not match');
    if (form.new_password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/change-password', { current_password: form.current_password, new_password: form.new_password });
      toast.success('Password changed successfully');
      updateUser({ force_password_change: false });
      navigate(`/${user.role}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Lock size={20} className="text-orange-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-500">You must change your password to continue</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['current_password', 'new_password', 'confirm'].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field.replace(/_/g, ' ')}
              </label>
              <input
                type="password"
                required
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                className="input focus:ring-orange-400"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </form>
      </motion.div>
    </div>
  );
}
