import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { wardenLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const GateLogin = () => {
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
      toast.success('Gate Entry Portal activated successfully!');
      navigate('/gate/entry');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access Denied. Only Warden/Admin can login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Gate Entry Portal" subtitle="Warden / Guard Authorization Required">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="warden@hostelflow.com"
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
            placeholder="••••••••"
            className="input-field"
          />
        </div>
        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 border-none">
          {loading ? <FiLoader className="animate-spin w-4 h-4" /> : <FiLogIn className="w-4 h-4" />}
          {loading ? 'Authorizing...' : 'Authorize Gate access'}
        </motion.button>
      </form>
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>This terminal is secure. All entry/exit events are recorded in the central database.</p>
      </div>
    </AuthLayout>
  );
};

export default GateLogin;
