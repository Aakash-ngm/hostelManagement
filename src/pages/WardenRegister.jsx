import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserPlus, FiLoader, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { wardenRegister } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const WardenRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await wardenRegister(form);
      login(res.data.data.user, res.data.data.token);
      toast.success('Account created successfully!');
      navigate('/warden/dashboard');
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors && responseData.errors.length > 0) {
        const errorDetails = responseData.errors.map(e => e.message).join(', ');
        toast.error(`${responseData.message}: ${errorDetails}`);
      } else {
        toast.error(responseData?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Warden Registration" subtitle="Create your warden account to manage the hostel">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="form-label">Select Warden Name</label>
          <select
            required
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="input-field bg-gray-900 border border-gray-700/50 text-white rounded-xl w-full p-2.5"
          >
            <option value="">-- Choose Warden Name --</option>
            <option value="sathish">Sathish</option>
            <option value="vijayan">Vijayan</option>
            <option value="kannan">Kannan</option>
            <option value="arul">Arul</option>
          </select>
        </div>
        <div>
          <label className="form-label">Email Address</label>
          <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="warden@college.edu.in" className="input-field" />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" className="input-field" />
        </div>
        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <FiLoader className="animate-spin w-4 h-4" /> : <FiUserPlus className="w-4 h-4" />}
          {loading ? 'Creating account...' : 'Create Account'}
        </motion.button>
      </form>
      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-gray-500">Already have an account?{' '}<Link to="/warden/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign In</Link></p>
        <Link to="/" className="flex items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"><FiArrowLeft className="w-3 h-3" /> Back to Home</Link>
      </div>
    </AuthLayout>
  );
};

export default WardenRegister;
