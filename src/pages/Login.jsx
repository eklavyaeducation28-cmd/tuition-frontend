import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/Logo.jpeg';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const { login }              = useAuth();
  const navigate               = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.force_password_change) {
        navigate('/change-password');
      } else {
        navigate(`/${user.role}`);
      }
    } catch {
      // error handled by api interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">

        {/* ── Left: branding ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <Link to="/" className="mb-8">
            <img src={logo} alt="Eklavya Education" className="h-24 w-auto object-contain drop-shadow-xl" />
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold font-poppins mb-3 leading-tight">
            Eklavya<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Education
            </span>
          </h1>
          <p className="text-indigo-300 text-base mb-2">Student & Parent Management Portal</p>
          <p className="text-indigo-400 text-sm mb-8">Kadi, Gujarat · Est. 2015</p>

          <div className="flex flex-col gap-2 text-sm text-indigo-300">
            {['Track Marks & Performance','View Attendance','Download Report Cards','Manage Tests & Homework'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-200 transition-colors mt-8">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </motion.div>

        {/* ── Right: login form ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 font-poppins">Sign In</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md mt-2"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : 'Sign In'
              }
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Contact admin if you don't have login credentials · 9574029090
          </p>
        </motion.div>

      </div>
    </div>
  );
}
