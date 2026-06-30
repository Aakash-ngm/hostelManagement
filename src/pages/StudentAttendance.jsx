import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiSearch, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { getMyHistory } from '../services/movementService';

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('7days'); // 'today' | 'yesterday' | '7days' | 'month' | 'custom'
  
  // Custom date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Fetch 365 days of history to cover all filter options
      const res = await getMyHistory(365);
      setRecords(res.data.data.records || []);
    } catch {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const getFilteredRecords = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return records.filter(r => {
      const recordDate = new Date(r.outTime);
      recordDate.setHours(0, 0, 0, 0);

      if (filter === 'today') {
        return recordDate.getTime() === today.getTime();
      }
      if (filter === 'yesterday') {
        return recordDate.getTime() === yesterday.getTime();
      }
      if (filter === '7days') {
        return recordDate >= sevenDaysAgo;
      }
      if (filter === 'month') {
        return recordDate >= startOfMonth;
      }
      if (filter === 'custom') {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const outTimeVal = new Date(r.outTime);
        return outTimeVal >= start && outTimeVal <= end;
      }
      return true;
    });
  };

  const filtered = getFilteredRecords();

  return (
    <StudentDashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiBookOpen className="text-emerald-400" /> My Attendance Logs
            </h1>
            <p className="text-xs text-gray-400">View and track all your gate entries and duration statistics</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'today', label: 'Today' },
              { key: 'yesterday', label: 'Yesterday' },
              { key: '7days', label: 'Last 7 Days' },
              { key: 'month', label: 'This Month' },
              { key: 'custom', label: 'Custom Date' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filter === 'custom' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3 pt-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="input-field py-1 px-2.5 text-xs w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="input-field py-1 px-2.5 text-xs w-36"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Table list */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner text="Fetching attendance data..." /></div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">OUT Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">IN Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Attendance Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r._id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-white text-sm font-semibold">
                        {new Date(r.outTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {new Date(r.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {r.inTime ? new Date(r.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">
                        {r.durationMinutes !== undefined && r.durationMinutes !== null ? `${r.durationMinutes} mins` : 'Outside'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="capitalize text-gray-300 font-medium">{r.movementType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={r.status} />
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-gray-500 text-sm">No attendance records found for this filter</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentAttendance;
