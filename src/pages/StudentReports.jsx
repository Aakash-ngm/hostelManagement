import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiCalendar, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { getMyHistory } from '../services/movementService';

const StudentReports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('weekly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getMyHistory(365);
      setRecords(res.data.data.records || []);
    } catch {
      toast.error('Failed to load history for reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter records based on report period
  const getPeriodRecords = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return records.filter(r => {
      const d = new Date(r.outTime);
      
      if (reportType === 'daily') {
        return d.toDateString() === today.toDateString();
      }
      if (reportType === 'weekly') {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return d >= oneWeekAgo;
      }
      if (reportType === 'monthly') {
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }
      if (reportType === 'yearly') {
        return d.getFullYear() === today.getFullYear();
      }
      return true;
    });
  };

  const periodRecords = getPeriodRecords();

  // Statistics calculation
  const totalOut = records.length;
  const totalIn = records.filter(r => r.inTime).length;
  const permissions = records.filter(r => r.movementType === 'StaffPermission' || r.movementType === 'Permission').length;
  const nativeLeaves = records.filter(r => r.movementType === 'NativeLeave').length;
  const emergency = records.filter(r => r.movementType === 'EmergencyPermission').length;
  const lateReturns = records.filter(r => r.isLate).length;

  const attendancePercentage = totalOut > 0 
    ? Math.max(0, Math.round(((totalOut - lateReturns) / totalOut) * 100))
    : 100;

  return (
    <StudentDashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiFileText className="text-emerald-400" /> My Attendance Reports
          </h1>
          <p className="text-xs text-gray-400">Generate period-based summaries and track overall ratings</p>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 space-y-2 border border-emerald-500/10">
            <p className="text-gray-400 text-xs font-semibold uppercase flex items-center gap-1.5">
              <FiPieChart className="text-emerald-400" /> Attendance Rating
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{attendancePercentage}%</span>
              <span className="text-xs text-emerald-400">On-Time Return</span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-card p-5 space-y-2">
            <p className="text-gray-400 text-xs font-semibold uppercase">Total Movement</p>
            <div className="text-3xl font-black text-white">{totalOut} <span className="text-xs font-normal text-gray-400">OUTs</span></div>
            <p className="text-[10px] text-gray-500">{totalIn} records checked in successfully</p>
          </div>

          <div className="glass-card p-5 space-y-2">
            <p className="text-gray-400 text-xs font-semibold uppercase">Permissions & Leaves</p>
            <div className="text-3xl font-black text-white">{permissions + nativeLeaves}</div>
            <p className="text-[10px] text-gray-500">{permissions} Staff Permissions | {nativeLeaves} Native Leaves</p>
          </div>

          <div className="glass-card p-5 space-y-2 border border-red-500/10">
            <p className="text-red-400 text-xs font-semibold uppercase">Late & Emergency</p>
            <div className="text-3xl font-black text-red-400">{lateReturns} <span className="text-xs font-normal text-gray-400">Lates</span></div>
            <p className="text-[10px] text-gray-500">{emergency} Emergency checkout declarations</p>
          </div>
        </div>

        {/* Report Period Selector & Table */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-white font-semibold flex items-center gap-1.5 text-sm">
              <FiCalendar className="text-emerald-400" /> Period Summary List
            </h3>
            <div className="flex gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
              {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
                <button
                  key={p}
                  onClick={() => setReportType(p)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    reportType === p
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner text="Generating report list..." /></div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-xs text-left min-w-[600px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-2.5 text-gray-400 font-semibold uppercase">Date</th>
                    <th className="px-4 py-2.5 text-gray-400 font-semibold uppercase">Type</th>
                    <th className="px-4 py-2.5 text-gray-400 font-semibold uppercase">Reason</th>
                    <th className="px-4 py-2.5 text-gray-400 font-semibold uppercase">OUT Time</th>
                    <th className="px-4 py-2.5 text-gray-400 font-semibold uppercase">IN Time</th>
                    <th className="px-4 py-2.5 text-gray-400 font-semibold uppercase">Duration</th>
                    <th className="px-4 py-2.5 text-gray-400 font-semibold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {periodRecords.map((r, idx) => (
                    <tr key={r._id || idx} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-white font-semibold">
                        {new Date(r.outTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-gray-300 capitalize">{r.movementType}</td>
                      <td className="px-4 py-3 text-gray-400 truncate max-w-[140px]">{r.reason}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono">
                        {new Date(r.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono">
                        {r.inTime ? new Date(r.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-mono">
                        {r.durationMinutes !== undefined && r.durationMinutes !== null ? `${r.durationMinutes} mins` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={r.status} />
                      </td>
                    </tr>
                  ))}
                  {periodRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-500">
                        No records found for the selected period
                      </td>
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

export default StudentReports;
