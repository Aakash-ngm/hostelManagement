import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiLoader, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { wardenLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const WardenLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await wardenLogin(form);
      const user = res.data.data.user;
      const token = res.data.data.token;

      if (user.role === 'admin-mess') {
        toast.error('Access Denied. Please use the Admin Portal.');
        setLoading(false);
        return;
      }

      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/warden/dashboard');
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors && responseData.errors.length > 0) {
        const errorDetails = responseData.errors.map(e => e.message).join(', ');
        toast.error(`${responseData.message || 'Login failed'}: ${errorDetails}`);
      } else {
        toast.error(responseData?.message || 'Login failed');
      }
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Enter your password"
              className="input-field pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
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
        <Link to="/" className="flex items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors">
          <FiArrowLeft className="w-3 h-3" /> Back to Home
        </Link>
      </div>
    </AuthLayout>
  );
};

export default WardenLogin;
