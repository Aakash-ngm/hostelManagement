import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiSearch, FiFilter } from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import LiveStatusTable from '../components/tables/LiveStatusTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getLiveStatus } from '../services/wardenService';

const LiveStatusPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLiveStatus();
        setStudents(res.data.data.students || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, []);

  const inside = students.filter(s => s.currentStatus === 'Inside').length;
  const outside = students.filter(s => s.currentStatus === 'Outside').length;
  const onPerm = students.filter(s => s.currentStatus === 'Permission').length;
  const onLeave = students.filter(s => s.currentStatus === 'NativeLeave').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiHome className="text-blue-400" /> Live Status
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time student status — refreshes every 15 seconds</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Inside', value: inside, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Outside', value: outside, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Permission', value: onPerm, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Native Leave', value: onLeave, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          ].map(({ label, value, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border p-4 text-center ${bg}`}
            >
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card p-5">
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner text="Loading students..." /></div>
          ) : (
            <LiveStatusTable students={students} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveStatusPage;
