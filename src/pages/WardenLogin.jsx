import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiLoader, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { wardenLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const WardenLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await wardenLogin(form);
      login(res.data.data.user, res.data.data.token);
      toast.success(`Welcome back, ${res.data.data.user.name}!`);
      navigate('/warden/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Warden Login" subtitle="Access your hostel management dashboard">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="admin@hostelflow.com"
            className="input-field"
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
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl px-4 py-3 text-xs text-blue-400">
          <p className="font-semibold mb-1">Default Credentials</p>
          <p>Email: admin@hostelflow.com</p>
          <p>Password: Admin@123</p>
        </div>
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <FiLoader className="animate-spin w-4 h-4" /> : <FiLogIn className="w-4 h-4" />}
          {loading ? 'Signing in...' : 'Sign In'}
        </motion.button>
      </form>
      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-gray-500">
          Don't have an account?{' '}
          <Link to="/warden/register" className="text-blue-400 hover:text-blue-300 font-medium">Register</Link>
        </p>
        <Link to="/" className="flex items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <FiArrowLeft className="w-3 h-3" /> Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
};

export default WardenLogin;
