import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserPlus, FiLoader, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { studentRegister } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'Other'];

const StudentRegister = () => {
  const [form, setForm] = useState({
    name: '', registerNumber: '', email: '', password: '',
    department: 'CSE', year: '1st Year', roomNumber: '', studentPhone: '', parentPhone: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== confirmPassword) return toast.error('Passwords do not match');

    // Strict email structure validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      return toast.error('Please enter a valid personal or professional email address (e.g. name@gmail.com or name@college.edu)');
    }

    // Gibberish / spam email detection
    const username = form.email.split('@')[0].toLowerCase();
    const hasRepeatingChars = /(.)\1\1/.test(username);
    const hasManyConsonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(username);
    const hasNoVowels = username.length >= 4 && !/[aeiouy]/i.test(username);
    const isKeyboardSpam = ['qwerty', 'asdfgh', 'zxcvbn', 'asdasd', 'testtest'].some(p => username.includes(p));

    if (hasRepeatingChars || hasManyConsonants || hasNoVowels || isKeyboardSpam) {
      return toast.error('Gibberish or dummy email addresses (e.g. baschcc@gmail.com) are not allowed.');
    }

    setLoading(true);
    try {
      const res = await studentRegister({ 
        ...form, 
        registerNumber: form.registerNumber.toUpperCase() 
      });
      login(res.data.data.user, res.data.data.token);
      toast.success('Registration successful!');
      navigate('/student/dashboard');
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
    <AuthLayout title="Student Registration" subtitle="Register to track your attendance and movements">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2">
            <label className="form-label">Full Name</label>
            <input required value={form.name} onChange={set('name')} placeholder="Arjun Kumar" className="input-field" />
          </div>
          <div>
            <label className="form-label">Register Number</label>
            <input required value={form.registerNumber} onChange={e => setForm(p => ({ ...p, registerNumber: e.target.value.toUpperCase() }))} placeholder="CS2021001" className="input-field font-mono uppercase" />
          </div>
          <div>
            <label className="form-label">Room Number</label>
            <input required value={form.roomNumber} onChange={set('roomNumber')} placeholder="A-101" className="input-field uppercase" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              value={form.email} 
              onChange={set('email')} 
              placeholder="e.g. name@gmail.com or name@college.edu.in" 
              className="input-field" 
            />
          </div>
          <div>
            <label className="form-label">Department</label>
            <select required value={form.department} onChange={set('department')} className="input-field">
               {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Year</label>
            <select required value={form.year} onChange={set('year')} className="input-field">
               {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Student Phone</label>
            <input type="tel" required value={form.studentPhone} onChange={set('studentPhone')} placeholder="9876543210" maxLength={10} className="input-field" />
          </div>
          <div>
            <label className="form-label">Parent Phone</label>
            <input type="tel" required value={form.parentPhone} onChange={set('parentPhone')} placeholder="9876543210" maxLength={10} className="input-field" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="form-label">Password</label>
            <input type="password" required value={form.password} onChange={set('password')} placeholder="Min. 6 characters" className="input-field" />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="form-label">Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="input-field" />
          </div>
        </div>
        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {loading ? <FiLoader className="animate-spin w-4 h-4" /> : <FiUserPlus className="w-4 h-4" />}
          {loading ? 'Registering...' : 'Register'}
        </motion.button>
      </form>
      <div className="mt-5 text-center text-sm space-y-2">
        <p className="text-gray-500">Already registered?{' '}<Link to="/student/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign In</Link></p>
        <Link to="/" className="flex items-center justify-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"><FiArrowLeft className="w-3 h-3" /> Back to Home</Link>
      </div>
    </AuthLayout>
  );
};

export default StudentRegister;
