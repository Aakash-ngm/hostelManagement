import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getActiveLeaves, getAllLeaves } from '../services/leaveService';

const LeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = tab === 'active' ? await getActiveLeaves() : await getAllLeaves();
        setLeaves(tab === 'active' ? res.data.data.leaves || [] : res.data.data.leaves || []);
      } catch { toast.error('Failed to load leaves'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [tab]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FiCalendar className="text-purple-400" /> Native Leaves</h1>
          <p className="text-sm text-gray-400 mt-0.5">Student native leave records</p>
        </div>
        <div className="flex gap-2">
          {['active', 'all'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-purple-600 text-white' : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:text-white'}`}>{t}</button>
          ))}
        </div>
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner text="Loading..." /></div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead><tr className="bg-gray-800/80">
                  {['Register No.', 'Name', 'Department', 'Room', 'Reason', 'From', 'To', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {leaves.map((l, i) => {
                    const days = Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <motion.tr key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-blue-400 text-xs font-medium">{l.registerNumber}</td>
                        <td className="px-4 py-3 text-white text-sm">{l.studentName}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{l.department}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{l.roomNumber}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-[150px] truncate">{l.reason}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(l.fromDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(l.toDate).toLocaleDateString('en-IN')} <span className="text-purple-400">({days}d)</span></td>
                        <td className="px-4 py-3"><Badge status={l.status} /></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {leaves.length === 0 && <div className="py-14 text-center text-gray-500 text-sm">No leaves found</div>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeavesPage;
