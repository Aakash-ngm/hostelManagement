import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookOpen, FiSun, FiMoon, FiClock, FiCalendar, FiActivity, FiChevronLeft, FiChevronRight, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { getMyHistory } from '../services/movementService';

const StudentAttendance = () => {
  const [gateRecords, setGateRecords] = useState([]);
  const [rollCallRecords, setRollCallRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rollcall'); // 'rollcall' | 'gate'
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'table'
  const [filter, setFilter] = useState('7days'); // 'today' | 'yesterday' | '7days' | 'month' | 'custom'
  
  // Custom date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Month navigation for Wall Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // 1. Fetch gate movement history
      const gateRes = await getMyHistory(365);
      setGateRecords(gateRes.data.data.records || []);

      // 2. Fetch daily roll-call logs
      const rcRes = await api.get('/movement/my-roll-call', { params: { days: 31 } });
      setRollCallRecords(rcRes.data.data.rollCallRecords || []);
      setSummary(rcRes.data.data.summary || {});
    } catch {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const formatDuration = (mins) => {
    if (mins === undefined || mins === null) return 'Still Outside';
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) return `${hrs}h ${m}m`;
    return `${m}m`;
  };

  const getFilteredGateRecords = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return gateRecords.filter(r => {
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

  const getFilteredRollCallRecords = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return rollCallRecords.filter(r => {
      const recordDate = new Date(r.date);
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
        return recordDate >= start && recordDate <= end;
      }
      return true;
    });
  };

  const filteredGates = getFilteredGateRecords();
  const filteredRollCalls = getFilteredRollCallRecords();
  const totalOutingMins = filteredGates.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);

  // Map dates in roll-call logs to quick lookup map
  const rcDateMap = {};
  rollCallRecords.forEach(rc => {
    rcDateMap[rc.date] = rc;
  });

  // Calendar parameters
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Present') return <span className="text-emerald-500 font-bold">✔</span>;
    if (status === 'Absent') return <span className="text-red-500 font-bold">✘</span>;
    if (status === 'Leave') return <span className="text-purple-500 font-bold">✈</span>;
    if (status === 'Permission') return <span className="text-blue-500 font-bold">⏱</span>;
    if (status === 'Late') return <span className="text-rose-500 font-bold">⚠️</span>;
    if (status === 'Outing') return <span className="text-cyan-500 font-bold">🚶</span>;
    return <span className="text-gray-600 font-bold">-</span>;
  };

  const getStatusBg = (status) => {
    if (status === 'Present') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'Absent') return 'bg-red-500/10 border-red-500/20 text-red-400';
    if (status === 'Leave') return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    if (status === 'Permission') return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    if (status === 'Late') return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    if (status === 'Outing') return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    return 'bg-gray-850/40 border-gray-700/50 text-gray-500';
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiBookOpen className="text-emerald-400" /> My Attendance Register
            </h1>
            <p className="text-xs text-gray-400">View morning check, night roll-call and gate log history</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-2 border border-emerald-500/20">
              <FiClock className="text-emerald-400 w-4 h-4" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Duration Out</p>
                <p className="text-xs font-bold text-emerald-400 font-mono">{formatDuration(totalOutingMins)}</p>
              </div>
            </div>

            {summary.morningPercentage !== undefined && (
              <div className="glass-card px-4 py-2 flex items-center gap-2 border border-blue-500/20">
                <FiSun className="text-blue-400 w-4 h-4" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Morning Present %</p>
                  <p className="text-xs font-bold text-blue-400 font-mono">{summary.morningPercentage}%</p>
                </div>
              </div>
            )}

            {summary.nightPercentage !== undefined && (
              <div className="glass-card px-4 py-2 flex items-center gap-2 border border-indigo-500/20">
                <FiMoon className="text-indigo-400 w-4 h-4" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Night Present %</p>
                  <p className="text-xs font-bold text-indigo-400 font-mono">{summary.nightPercentage}%</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab & View Mode Toggles */}
        <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-gray-950 border border-gray-800 rounded-xl p-1 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('rollcall')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rollcall' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiCalendar className="w-3.5 h-3.5" /> Daily Roll-Call status
            </button>
            <button
              onClick={() => setActiveTab('gate')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'gate' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiActivity className="w-3.5 h-3.5" /> Gate Movement logs
            </button>
          </div>

          {activeTab === 'rollcall' && (
            <div className="flex bg-gray-900 border border-gray-850 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  viewMode === 'calendar' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiCalendar className="w-3 h-3" /> Calendar Method
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FiList className="w-3 h-3" /> List view
              </button>
            </div>
          )}

          {activeTab === 'gate' && (
            <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === f.key
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom date range fields */}
        {activeTab === 'gate' && filter === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-3 flex flex-wrap items-center gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-white py-1 px-2.5 rounded-lg text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-gray-950 border border-gray-800 text-white py-1 px-2.5 rounded-lg text-xs focus:outline-none"
              />
            </div>
          </motion.div>
        )}

        {/* Attendance Body */}
        <div className="glass-card p-4 overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center"><LoadingSpinner text="Loading register history..." /></div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'rollcall' && viewMode === 'calendar' && (
                /* VIEW 1: STUNNING MONTHLY WALL CALENDAR FOR STUDENTS */
                <motion.div
                  key="calendar-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="text-white text-sm font-semibold flex items-center gap-1.5">
                      <FiCalendar className="text-emerald-400" /> Attendance Wall Calendar
                    </h3>
                    <div className="flex items-center gap-3 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-xl">
                      <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white"><FiChevronLeft className="w-4 h-4" /></button>
                      <span className="text-xs font-bold text-white min-w-[100px] text-center">{monthNames[currentMonth]} {currentYear}</span>
                      <button onClick={handleNextMonth} className="text-gray-400 hover:text-white"><FiChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 pb-1">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded flex items-center justify-center font-bold text-[8px]">✔</span> Present</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded flex items-center justify-center font-bold text-[8px]">✘</span> Absent</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded flex items-center justify-center font-bold text-[8px]">✈</span> Native Leave</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded flex items-center justify-center font-bold text-[8px]">⏱</span> Permission</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded flex items-center justify-center font-bold text-[8px]">⚠️</span> Late Return</div>
                  </div>

                  {/* Wall Calendar Sheet Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Names */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="text-center py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
                    ))}

                    {/* Empty Padding */}
                    {Array.from({ length: firstDayIndex }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="bg-gray-900/10 border border-gray-800/10 rounded-xl min-h-[85px]" />
                    ))}

                    {/* Active Days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                      const dailyRecord = rcDateMap[dateStr];
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;

                      return (
                        <div
                          key={dateStr}
                          className={`border rounded-xl p-3 min-h-[95px] flex flex-col justify-between transition-all relative ${
                            isToday 
                              ? 'bg-emerald-950/20 border-emerald-500 shadow-lg shadow-emerald-500/5' 
                              : dailyRecord 
                                ? 'bg-gray-900/40 border-gray-800/80 hover:border-gray-700/60' 
                                : 'bg-gray-950/20 border-gray-900/50 opacity-40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold font-mono ${isToday ? 'text-emerald-400' : 'text-gray-400'}`}>
                              {dayNumber}
                              {isToday && <span className="ml-1 text-[8px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-sans uppercase">Today</span>}
                            </span>

                            {dailyRecord && (
                              <div className="flex items-center gap-1.5">
                                {/* Morning Sun Badge */}
                                <div
                                  className={`w-7 h-7 rounded-full border flex flex-col items-center justify-center transition-all hover:scale-105 ${getStatusBg(dailyRecord.morningStatus)}`}
                                  title={`Morning Check: ${dailyRecord.morningStatus}`}
                                >
                                  <FiSun className="w-2.5 h-2.5" />
                                  <span className="text-[7px] font-extrabold mt-0.5 leading-none">{getStatusIcon(dailyRecord.morningStatus)}</span>
                                </div>

                                {/* Night Moon Badge */}
                                <div
                                  className={`w-7 h-7 rounded-full border flex flex-col items-center justify-center transition-all hover:scale-105 ${getStatusBg(dailyRecord.nightStatus)}`}
                                  title={`Night Check: ${dailyRecord.nightStatus}`}
                                >
                                  <FiMoon className="w-2.5 h-2.5" />
                                  <span className="text-[7px] font-extrabold mt-0.5 leading-none">{getStatusIcon(dailyRecord.nightStatus)}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status / Log Details */}
                          <div className="mt-2 space-y-1">
                            {dailyRecord ? (
                              <>
                                {/* If status is not Present, show a textual tag */}
                                {dailyRecord.morningStatus !== 'Present' && dailyRecord.morningStatus !== 'Absent' && (
                                  <div className="text-[9px] text-purple-400 font-semibold truncate bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/10 w-fit">
                                    ✈ {dailyRecord.morningStatus}
                                  </div>
                                )}
                                {dailyRecord.nightStatus !== 'Present' && dailyRecord.nightStatus !== 'Absent' && (
                                  <div className="text-[9px] text-amber-400 font-semibold truncate bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 w-fit">
                                    ⏱ {dailyRecord.nightStatus}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-[9px] text-gray-600 font-medium italic">No Log</div>
                            )}

                            {/* Movement Log Outing Times */}
                            {dailyRecord?.movementLog && (
                              <div className="text-[9px] text-cyan-400 font-mono flex items-center gap-0.5 truncate" title="Gate Movement Logged">
                                <span>🚶 {new Date(dailyRecord.movementLog.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                {dailyRecord.movementLog.durationMinutes && (
                                  <span className="text-gray-500">({dailyRecord.movementLog.durationMinutes}m)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'rollcall' && viewMode === 'table' && (
                /* VIEW 2: FLAT LIST LOG VIEW */
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-auto"
                >
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-800/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Morning check (8 AM)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Night Roll-Call (9 PM)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks / Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {filteredRollCalls.map((rc, i) => (
                        <tr key={rc._id || i} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3 text-white text-sm font-semibold">
                            {new Date(rc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBg(rc.morningStatus)}`}>
                              <FiSun className="w-3.5 h-3.5" /> {rc.morningStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBg(rc.nightStatus)}`}>
                              <FiMoon className="w-3.5 h-3.5" /> {rc.nightStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 italic">
                            {rc.remarks || 'Auto Checked'}
                          </td>
                        </tr>
                      ))}
                      {filteredRollCalls.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-14 text-center text-gray-500 text-sm">No roll call logs found for this filter</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === 'gate' && (
                /* Tab 2: Gate movement logs list */
                <motion.div
                  key="gate-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-auto"
                >
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-800/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">OUT Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">IN Time</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Calculated Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Movement Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {filteredGates.map((r, i) => (
                        <tr key={r._id || i} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3 text-white text-sm font-semibold">
                            {new Date(r.outTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3 text-amber-400 font-mono text-xs">
                            {new Date(r.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 text-emerald-400 font-mono text-xs">
                            {r.inTime ? new Date(r.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-300 text-xs font-mono font-semibold">
                            {formatDuration(r.durationMinutes)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="capitalize text-gray-300 font-medium">{r.movementType}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge status={r.status} />
                          </td>
                        </tr>
                      ))}
                      {filteredGates.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-14 text-center text-gray-500 text-sm">No gate log records found for this filter</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentAttendance;
