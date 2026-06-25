import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DailyAttendanceChart, WeeklyTrendChart } from '../components/charts/AttendanceChart';
import { getDailyReport, getWeeklyReport, getMonthlyReport, exportReport } from '../services/reportService';

const TABS = ['Daily', 'Weekly', 'Monthly'];

const ReportsPage = () => {
  const [tab, setTab] = useState('Daily');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === 'Daily') res = await getDailyReport(selectedDate);
      else if (tab === 'Weekly') res = await getWeeklyReport();
      else res = await getMonthlyReport(selectedYear, selectedMonth);
      setReport(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch report');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [tab, selectedDate, selectedMonth, selectedYear]);

  const handleExport = () => {
    const params = tab === 'Daily' ? { date: selectedDate }
      : tab === 'Monthly' ? { year: selectedYear, month: selectedMonth }
      : {};
    exportReport(tab.toLowerCase(), params);
    toast.success('Downloading Excel report...');
  };

  const records = report?.records || [];
  const stats = report?.stats || {};

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-sm text-gray-400 mt-0.5">Generate and export hostel attendance reports</p>
          </div>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
            <FiDownload className="w-4 h-4" /> Export Excel
          </button>
        </div>

        {/* Tab + Filters */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-1 md:flex-initial text-center ${
                  tab === t ? 'bg-blue-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto justify-end">
            {tab === 'Daily' && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <FiCalendar className="text-gray-400 w-4 h-4 flex-shrink-0" />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field py-2 w-full md:w-auto" />
              </div>
            )}
            {tab === 'Monthly' && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="input-field py-2 flex-1 md:w-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('en-IN', { month: 'long' })}</option>
                  ))}
                </select>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="input-field py-2 flex-1 md:w-auto">
                  {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Outings', value: stats.total || records.length, color: 'text-blue-400' },
              { label: 'Late Returns', value: stats.late || 0, color: 'text-red-400' },
              { label: 'On Time', value: stats.onTime || stats.returned || 0, color: 'text-emerald-400' },
              { label: 'Pending', value: stats.pending || stats.outside || 0, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Weekly chart */}
        {tab === 'Weekly' && report?.dailyStats && (
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4">Weekly Trend</h3>
            <WeeklyTrendChart data={report.dailyStats.map(d => ({ ...d, day: d.date.slice(5) }))} />
          </div>
        )}

        {/* Records table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-800/50 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Movement Records</h3>
            <span className="text-xs text-gray-400">{records.length} records</span>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner text="Loading report..." /></div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    {['S.No', 'Register No.', 'Name', 'Dept', 'Year', 'Movement Type', 'Out Time', 'In Time', 'Duration', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {records.map((r, i) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.015 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-blue-400 text-xs font-medium">{r.registerNumber}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{r.studentName}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.department}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.year}</td>
                      <td className="px-4 py-3 text-xs"><Badge status={r.movementType} label={r.movementType} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                        {r.outTime ? new Date(r.outTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">
                        {r.inTime
                          ? <span className="text-emerald-400">{new Date(r.inTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                          : <span className="text-amber-400">Not returned</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {r.durationMinutes ? `${r.durationMinutes}m` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.isLate
                          ? <span className="inline-flex items-center gap-1 text-xs text-red-400 font-semibold"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> Late ({r.lateByMinutes}m)</span>
                          : <Badge status={r.status} />}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {records.length === 0 && (
                <div className="py-14 text-center text-gray-500">No records for this period</div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
