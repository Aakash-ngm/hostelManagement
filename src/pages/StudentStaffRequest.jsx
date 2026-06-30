import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiPlus, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { getMyPermissions, grantStaffPermission } from '../services/permissionService';
import { useAuth } from '../context/AuthContext';

const StudentStaffRequest = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [permissionDate, setPermissionDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [staffName, setStaffName] = useState('');
  const [reason, setReason] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await getMyPermissions();
      setPermissions(res.data.data.permissions || []);
    } catch {
      toast.error('Failed to load permission history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (permissionDate === todayStr) {
      return toast.error('Same-day Staff Permission is not allowed. Please use Emergency Permission if required.');
    }
    if (permissionDate < todayStr) {
      return toast.error('Permission date cannot be in the past.');
    }

    setSubmitting(true);
    try {
      await grantStaffPermission({
        registerNumber: user.registerNumber,
        permissionDate,
        fromTime,
        toTime,
        staffName,
        reason
      });
      toast.success('Staff Permission request submitted successfully!');
      // Reset form
      setPermissionDate('');
      setFromTime('');
      setToTime('');
      setStaffName('');
      setReason('');
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request permission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiClock className="text-emerald-400" /> Staff Permission Request
          </h1>
          <p className="text-xs text-gray-400">Request permission from a hostel staff member at least one day in advance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="glass-card p-5 space-y-4 h-fit">
            <h3 className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <FiPlus className="text-emerald-400" /> New Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label text-xs">Permission Date</label>
                <input
                  type="date"
                  required
                  value={permissionDate}
                  onChange={e => setPermissionDate(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="form-label text-xs">Select Staff Name</label>
                <select
                  required
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="input-field bg-gray-900 border border-gray-700/50 text-white rounded-xl w-full p-2.5 text-sm"
                >
                  <option value="">-- Choose Staff Name --</option>
                  <option value="sathish">Sathish</option>
                  <option value="vijayan">Vijayan</option>
                  <option value="kannan">Kannan</option>
                  <option value="arul">Arul</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Reason</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">From Time</label>
                  <input
                    type="time"
                    required
                    value={fromTime}
                    onChange={e => setFromTime(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">To Time</label>
                  <input
                    type="time"
                    required
                    value={toTime}
                    onChange={e => setToTime(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </motion.button>
            </form>
          </div>

          {/* History */}
          <div className="glass-card p-5 md:col-span-2 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <FiList className="text-emerald-400" /> Request History
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center"><LoadingSpinner text="Loading history..." /></div>
            ) : (
              <div className="overflow-auto max-h-[420px]">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-800/80">
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Staff</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Date</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Time Range</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Reason</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {permissions.map((p, idx) => (
                      <tr key={p._id || idx} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-white capitalize">{p.staffName}</td>
                        <td className="px-3 py-2.5 text-gray-400 font-mono">
                          {p.permissionStartTime ? new Date(p.permissionStartTime).toLocaleDateString('en-IN') : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-400 font-mono">
                          {p.permissionStartTime ? new Date(p.permissionStartTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'} to {p.permissionEndTime ? new Date(p.permissionEndTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-gray-400 truncate max-w-[120px]">{p.reason}</td>
                        <td className="px-3 py-2.5">
                          <Badge status={p.status} />
                        </td>
                      </tr>
                    ))}
                    {permissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">No requests found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentStaffRequest;
