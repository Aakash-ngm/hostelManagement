import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiPlus, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { getMyLeaves, applyLeave, editLeave, cancelLeave } from '../services/leaveService';
import { getWardens } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const StudentLeaveRequest = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedWardenId, setSelectedWardenId] = useState('');
  const [outTimeSeason, setOutTimeSeason] = useState('Morning');
  const [inTimeSeason, setInTimeSeason] = useState('Night');
  const [reason, setReason] = useState('');
  const [editingLeaveId, setEditingLeaveId] = useState(null);

  const handleStartEdit = (l) => {
    setEditingLeaveId(l._id);
    setFromDate(new Date(l.fromDate).toISOString().split('T')[0]);
    setToDate(new Date(l.toDate).toISOString().split('T')[0]);
    setSelectedWardenId(l.wardenId);
    setOutTimeSeason(l.outTimeSeason || 'Morning');
    setInTimeSeason(l.inTimeSeason || 'Night');
    setReason(l.reason);
  };

  const handleCancelEdit = () => {
    setEditingLeaveId(null);
    setFromDate('');
    setToDate('');
    setSelectedWardenId('');
    setOutTimeSeason('Morning');
    setInTimeSeason('Night');
    setReason('');
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await cancelLeave(id);
      toast.success('Leave request cancelled successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  const calculateLiveDuration = () => {
    if (!fromDate || !toDate) return null;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return null;
    const diffDays = Math.round((to - from) / (1000 * 60 * 60 * 24));
    const isLateDeparture = outTimeSeason === 'Evening' || outTimeSeason === 'Night';
    const days = Math.max(1, isLateDeparture ? diffDays - 1 : diffDays);
    return days;
  };

  const liveDays = calculateLiveDuration();

  const fetchData = async () => {
    try {
      const [leavesRes, wardensRes] = await Promise.all([
        getMyLeaves(),
        getWardens()
      ]);
      setLeaves(leavesRes.data.data.leaves || []);
      setWardens(wardensRes.data.data.wardens || []);
    } catch {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) return toast.error('Please select dates');
    if (new Date(toDate) < new Date(fromDate)) {
      return toast.error('To Date cannot be earlier than From Date');
    }

    setSubmitting(true);
    try {
      if (editingLeaveId) {
        await editLeave(editingLeaveId, {
          fromDate,
          toDate,
          reason,
          wardenId: selectedWardenId,
          outTimeSeason,
          inTimeSeason
        });
        toast.success('Native Leave request updated successfully! Re-approval required.');
        setEditingLeaveId(null);
      } else {
        await applyLeave({
          registerNumber: user.registerNumber,
          fromDate,
          toDate,
          reason,
          wardenId: selectedWardenId,
          outTimeSeason,
          inTimeSeason
        });
        toast.success('Native Leave request submitted successfully!');
      }
      // Reset form
      setFromDate('');
      setToDate('');
      setSelectedWardenId('');
      setOutTimeSeason('Morning');
      setInTimeSeason('Night');
      setReason('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiCalendar className="text-emerald-400" /> Native Leave Request
          </h1>
          <p className="text-xs text-gray-400">Request multi-day leave to travel home. Requires approval from your assigned Hostel Warden.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="glass-card p-5 space-y-4 h-fit">
            <h3 className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <FiPlus className="text-emerald-400" /> Apply Leave
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label text-xs">Request Warden</label>
                <select
                  required
                  value={selectedWardenId}
                  onChange={e => setSelectedWardenId(e.target.value)}
                  className="input-field bg-gray-900 border border-gray-700/50 text-white rounded-xl w-full p-2.5 text-sm"
                >
                  <option value="">-- Choose Warden --</option>
                  {wardens.map(w => (
                    <option key={w._id} value={w._id}>{w.name} ({w.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Reason</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Enter reason for leave..."
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">Departure Slot</label>
                  <select
                    required
                    value={outTimeSeason}
                    onChange={e => {
                      setOutTimeSeason(e.target.value);
                      setInTimeSeason(e.target.value);
                    }}
                    className="input-field bg-gray-900 border border-gray-700/50 text-white rounded-xl w-full p-2.5 text-sm"
                  >
                    <option value="Morning">Morning (06:00 AM - 12:00 PM)</option>
                    <option value="Afternoon">Afternoon (12:00 PM - 04:00 PM)</option>
                    <option value="Evening">Evening (04:00 PM - 07:00 PM)</option>
                    <option value="Night">Night (07:00 PM - 10:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Return Slot</label>
                  <select
                    required
                    value={inTimeSeason}
                    onChange={e => setInTimeSeason(e.target.value)}
                    className="input-field bg-gray-900 border border-gray-700/50 text-white rounded-xl w-full p-2.5 text-sm"
                  >
                    <option value="Morning">Morning (06:00 AM - 12:00 PM)</option>
                    <option value="Afternoon">Afternoon (12:00 PM - 04:00 PM)</option>
                    <option value="Evening">Evening (04:00 PM - 07:00 PM)</option>
                    <option value="Night">Night (07:00 PM - 10:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs">From Date</label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">To Date</label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {liveDays !== null && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-semibold text-center">
                  Estimated Leave Duration: {liveDays} {liveDays === 1 ? 'day' : 'days'} ({outTimeSeason} Departure)
                </div>
              )}

              <div className="flex gap-2">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5 font-bold"
                >
                  {submitting ? 'Processing...' : editingLeaveId ? 'Update Request' : 'Submit Request'}
                </motion.button>
                {editingLeaveId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-secondary py-2.5 text-xs font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* History */}
          <div className="glass-card p-5 md:col-span-2 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <FiList className="text-emerald-400" /> Leave History
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center"><LoadingSpinner text="Loading leave history..." /></div>
            ) : (
              <div className="overflow-auto max-h-[420px]">
                <table className="w-full text-xs text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-800/80">
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Warden</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">From Date</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">To Date</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Reason</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Status</th>
                      <th className="px-3 py-2 text-gray-400 font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {leaves.map((l, idx) => (
                      <tr key={l._id || idx} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-white capitalize">
                          {l.wardenName}
                          <span className="block text-[10px] text-gray-500 font-normal">Out: {l.outTimeSeason || 'Morning'}</span>
                          <span className="block text-[10px] text-gray-500 font-normal">In: {l.inTimeSeason || 'Night'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-400 font-mono">
                          {new Date(l.fromDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-3 py-2.5 text-gray-400 font-mono">
                          {new Date(l.toDate).toLocaleDateString('en-IN')}{' '}
                          {(() => {
                            const diffDays = Math.round((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24));
                            const isLateDeparture = l.outTimeSeason === 'Evening' || l.outTimeSeason === 'Night';
                            const days = Math.max(1, isLateDeparture ? diffDays - 1 : diffDays);
                            return <span className="text-purple-400">({days}d)</span>;
                          })()}
                        </td>
                        <td className="px-3 py-2.5 text-gray-400 truncate max-w-[120px]">{l.reason}</td>
                        <td className="px-3 py-2.5">
                          <Badge status={l.status} />
                        </td>
                        <td className="px-3 py-2.5">
                          {(l.status === 'Pending' || l.status === 'Approved') ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleStartEdit(l)}
                                className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-blue-400 rounded-lg font-semibold text-[10px] transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelRequest(l._id)}
                                className="px-2 py-1 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold text-[10px] transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {leaves.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">No requests found</td>
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

export default StudentLeaveRequest;
