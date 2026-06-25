import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMyHistory } from '../services/movementService';

const StudentHistory = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyHistory(days);
        setRecords(res.data.data.records || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, [days]);

  const late = records.filter(r => r.isLate).length;
  const onTime = records.filter(r => !r.isLate && r.inTime).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"><FiArrowLeft className="w-4 h-4" /> Home</Link>
          <div className="text-right">
            <p className="text-white font-bold">{user?.name}</p>
            <p className="text-blue-400 text-xs font-mono">{user?.registerNumber}</p>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FiClock className="text-blue-400" /> Movement History</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your attendance and outing records</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Outings', value: records.length, color: 'text-blue-400' },
            { label: 'On Time', value: onTime, color: 'text-emerald-400' },
            { label: 'Late Returns', value: late, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Show last:</span>
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${days === d ? 'bg-blue-600 text-white' : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:text-white'}`}>{d} days</button>
          ))}
        </div>

        {/* Records */}
        <div className="space-y-2">
          {loading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner text="Loading history..." /></div>
          ) : records.length === 0 ? (
            <div className="glass-card p-12 text-center text-gray-500">No records in this period</div>
          ) : records.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card p-4 flex items-start gap-4 ${r.isLate ? 'border-red-500/20' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${r.isLate ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                {new Date(r.outTime).getDate()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge status={r.movementType} label={r.movementType} />
                  {r.isLate && <span className="text-xs text-red-400 font-semibold">⚠️ Late by {r.lateByMinutes}m</span>}
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  <span>Out: <span className="text-white">{new Date(r.outTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span></span>
                  {r.inTime && <span>In: <span className="text-emerald-400">{new Date(r.inTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span></span>}
                  {r.durationMinutes && <span>Duration: <span className="text-blue-400">{r.durationMinutes}m</span></span>}
                </div>
                {r.reason && <p className="text-xs text-gray-500 mt-1">Reason: {r.reason}</p>}
              </div>
              <Badge status={r.isLate ? 'LateReturn' : r.status} className="flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentHistory;
