import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getActiveLeaves, getAllLeaves, getPendingLeaves, approveLeave, rejectLeave } from '../services/leaveService';

const LeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'pending') {
        res = await getPendingLeaves();
      } else if (tab === 'active') {
        res = await getActiveLeaves();
      } else {
        res = await getAllLeaves();
      }
      setLeaves(res.data.data.leaves || []);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [tab]);

  const handleApprove = async (id) => {
    try {
      await approveLeave(id);
      toast.success('Leave request approved');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeave(id);
      toast.success('Leave request rejected');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject leave');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiCalendar className="text-purple-400" /> Native Leaves
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Student native leave records and approvals</p>
        </div>
        <div className="flex gap-2">
          {['pending', 'active', 'all'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner text="Loading..." />
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    {['Register No.', 'Name', 'Department', 'Room', 'Reason', 'From', 'To', 'Status', tab === 'pending' && 'Actions']
                      .filter(Boolean)
                      .map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {leaves.map((l, i) => {
                    const days = Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <motion.tr
                        key={l._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-blue-400 text-xs font-medium">
                          {l.registerNumber}
                        </td>
                        <td className="px-4 py-3 text-white text-sm">{l.studentName}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{l.department}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{l.roomNumber}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">
                          {l.reason}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                          {new Date(l.fromDate).toLocaleDateString('en-IN')}
                          <span className="block text-[10px] text-purple-400 font-semibold mt-0.5 capitalize">{l.outTimeSeason || 'Morning'}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                          {new Date(l.toDate).toLocaleDateString('en-IN')}{' '}
                          <span className="text-purple-400">({days}d)</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={l.status} />
                        </td>
                        {tab === 'pending' && (
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(l._id)}
                                className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(l._id)}
                                className="px-2.5 py-1 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {leaves.length === 0 && (
                <div className="py-14 text-center text-gray-500 text-sm">No leaves found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeavesPage;
