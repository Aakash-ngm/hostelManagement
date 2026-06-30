import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getActivePermissions, getAllPermissions, approveStaffPermission, rejectStaffPermission } from '../services/permissionService';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = tab === 'active' ? await getActivePermissions() : await getAllPermissions();
      setPermissions(res.data.data.permissions || []);
    } catch { toast.error('Failed to load permissions'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPermissions();
  }, [tab]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FiClock className="text-blue-400" /> Permissions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Student permission records</p>
        </div>
        <div className="flex gap-2">
          {['active', 'all'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:text-white'}`}>{t}</button>
          ))}
        </div>
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner text="Loading..." /></div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead><tr className="bg-gray-800/80">
                  {['Register No.', 'Name', 'Reason', 'Start Time', 'Until', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {permissions.map((p, i) => (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-400 text-xs font-medium">{p.registerNumber}</td>
                      <td className="px-4 py-3 text-white text-sm">{p.studentName}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px] truncate">{p.reason}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{new Date(p.startTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</td>
                      <td className="px-4 py-3 text-xs font-mono">
                        <span className={new Date(p.permissionUntil) < new Date() ? 'text-red-400' : 'text-emerald-400'}>
                          {new Date(p.permissionUntil).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-4 py-3"><Badge status={p.status} /></td>
                      <td className="px-4 py-3 text-xs">
                        {p.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await approveStaffPermission(p._id);
                                  toast.success('Approved successfully');
                                  fetchPermissions();
                                } catch { toast.error('Failed to approve'); }
                              }}
                              className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-bold transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await rejectStaffPermission(p._id);
                                  toast.success('Rejected successfully');
                                  fetchPermissions();
                                } catch { toast.error('Failed to reject'); }
                              }}
                              className="px-2.5 py-1 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 rounded-lg font-bold transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {permissions.length === 0 && <div className="py-14 text-center text-gray-500 text-sm">No permissions found</div>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PermissionsPage;
