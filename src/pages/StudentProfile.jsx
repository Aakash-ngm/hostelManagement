import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import { changePassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiUser className="text-emerald-400" /> Student Profile
          </h1>
          <p className="text-xs text-gray-400">View your registration details and update your security credentials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="glass-card p-5 md:col-span-2 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <FiUser className="text-emerald-400" /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3 bg-gray-900/40 border border-gray-800 rounded-xl">
                <p className="text-gray-400">Full Name</p>
                <p className="text-white font-bold">{user?.name}</p>
              </div>
              
              <div className="space-y-1 p-3 bg-gray-900/40 border border-gray-800 rounded-xl">
                <p className="text-gray-400">Register Number</p>
                <p className="text-white font-bold font-mono uppercase">{user?.registerNumber}</p>
              </div>

              <div className="space-y-1 p-3 bg-gray-900/40 border border-gray-800 rounded-xl">
                <p className="text-gray-400">Department</p>
                <p className="text-white font-bold">{user?.department}</p>
              </div>

              <div className="space-y-1 p-3 bg-gray-900/40 border border-gray-800 rounded-xl">
                <p className="text-gray-400">Year of Study</p>
                <p className="text-white font-bold">{user?.year}</p>
              </div>

              <div className="space-y-1 p-3 bg-gray-900/40 border border-gray-800 rounded-xl">
                <p className="text-gray-400">Room Number</p>
                <p className="text-white font-bold font-mono">{user?.roomNumber}</p>
              </div>

              <div className="space-y-1 p-3 bg-gray-900/40 border border-gray-800 rounded-xl">
                <p className="text-gray-400">Student Phone</p>
                <p className="text-white font-bold font-mono">{user?.studentPhone || '-'}</p>
              </div>

              <div className="space-y-1 p-3 bg-gray-900/40 border border-gray-800 rounded-xl sm:col-span-2">
                <p className="text-gray-400">Parent / Guardian Phone</p>
                <p className="text-white font-bold font-mono">{user?.parentPhone || '-'}</p>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 italic bg-gray-900/20 p-2 rounded-lg border border-gray-800/40">
              * Note: Personal registration information is locked and cannot be edited. If there is a correction, please contact the Hostel Administration.
            </p>
          </div>

          {/* Change Password */}
          <div className="glass-card p-5 space-y-4 h-fit">
            <h3 className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <FiLock className="text-emerald-400" /> Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="form-label text-xs">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="form-label text-xs">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="form-label text-xs">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Verify new password"
                  className="input-field text-sm"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentProfile;
