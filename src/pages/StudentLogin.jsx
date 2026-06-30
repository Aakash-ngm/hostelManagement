import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiLoader, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { studentLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const StudentLogin = () => {
  const [form, setForm] = useState({ registerNumber: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await studentLogin({ ...form, registerNumber: form.registerNumber.toUpperCase() });
      login(res.data.data.user, res.data.data.token);
      toast.success(`Welcome, ${res.data.data.user.name}!`);
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Student Login" subtitle="Access your attendance and movement history">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Register Number</label>
          <input
            type="text"
            required
            value={form.registerNumber}
            onChange={e => setForm(p => ({ ...p, registerNumber: e.target.value.toUpperCase() }))}
            placeholder="CS2021001"
            className="input-field font-mono uppercase tracking-wide"
          />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="Enter your password"
            className="input-field"
          />
        </div>
        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <FiLoader className="animate-spin w-4 h-4" /> : <FiLogIn className="w-4 h-4" />}
          {loading ? 'Signing in...' : 'Sign In'}
        </motion.button>
      </form>
      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-gray-500">New student?{' '}<Link to="/student/register" className="text-blue-400 hover:text-blue-300 font-medium">Register here</Link></p>
        <Link to="/movement" className="text-emerald-400 hover:text-emerald-300 font-medium block">→ Mark Attendance (No login needed)</Link>
        <Link to="/" className="flex items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"><FiArrowLeft className="w-3 h-3" /> Back to Home</Link>
      </div>
    </AuthLayout>
  );
};

export default StudentLogin;
