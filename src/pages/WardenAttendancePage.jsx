import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckSquare, FiSun, FiMoon, FiSearch, FiRefreshCw, FiDownload, FiUser, FiClock, FiCalendar, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import * as XLSX from 'xlsx';
import api from '../services/api';

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPTS = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'Other'];

const WardenAttendancePage = () => {
  const [rollCallData, setRollCallData] = useState([]);
  const [summary, setSummary] = useState({ totalMorningPresent: 0, totalNightPresent: 0, morningPercentage: 100, nightPercentage: 100 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [days, setDays] = useState(30); // 30 days default for calendar
  const [viewMode, setViewMode] = useState('calendar'); // 'grid' | 'calendar' | 'table'
  
  // Student selection for Wall Calendar view
  const [activeStudentReg, setActiveStudentReg] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchRollCall = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movement/roll-call', {
        params: {
          year: selectedYear !== 'All' ? selectedYear : undefined,
          department: selectedDept !== 'All' ? selectedDept : undefined,
          days: 31 // Fetch full month data
        }
      });
      const data = res.data.data.rollCallRecords || [];
      setRollCallData(data);
      setSummary(res.data.data.summary || {});

      // Set default active student if not set
      if (data.length > 0 && !activeStudentReg) {
        setActiveStudentReg(data[0].registerNumber);
      }
    } catch (err) {
      toast.error('Failed to load roll-call attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRollCall();
  }, [selectedYear, selectedDept]);

  const handleToggleStatus = async (id, field, currentVal) => {
    const nextStatusMap = {
      morningStatus: { Present: 'Absent', Absent: 'Permission', Permission: 'Leave', Leave: 'Present' },
      nightStatus: { Present: 'Absent', Absent: 'Late', Late: 'Outing', Outing: 'Leave', Leave: 'Present' }
    };

    const nextVal = nextStatusMap[field][currentVal] || 'Present';
    try {
      await api.post('/movement/roll-call/update', {
        id,
        [field]: nextVal,
        remarks: 'Warden manual update'
      });
      toast.success(`Updated ${field === 'morningStatus' ? 'Morning' : 'Night'} status to ${nextVal}`);
      
      setRollCallData(prev => prev.map(rc => rc._id === id ? { ...rc, [field]: nextVal } : rc));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status, type) => {
    if (status === 'Present') return <span className="text-emerald-500 font-bold text-xs">✔</span>;
    if (status === 'Absent') return <span className="text-red-500 font-bold text-xs">✘</span>;
    if (status === 'Leave') return <span className="text-purple-500 font-bold text-xs">✈</span>;
    if (status === 'Permission') return <span className="text-blue-500 font-bold text-xs">⏱</span>;
    if (status === 'Late') return <span className="text-rose-500 font-bold text-xs">⚠️</span>;
    if (status === 'Outing') return <span className="text-cyan-500 font-bold text-xs">🚶</span>;
    return <span className="text-gray-600 font-bold text-xs">-</span>;
  };

  const getStatusBg = (status) => {
    if (status === 'Present') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'Absent') return 'bg-red-500/10 border-red-500/20 text-red-400';
    if (status === 'Leave') return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    if (status === 'Permission') return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    if (status === 'Late') return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    if (status === 'Outing') return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    return 'bg-gray-800/40 border-gray-700/50 text-gray-500';
  };

  // Group roll-call records by student
  const studentsMap = {};
  rollCallData.forEach(rc => {
    if (!studentsMap[rc.registerNumber]) {
      studentsMap[rc.registerNumber] = {
        name: rc.studentName,
        registerNumber: rc.registerNumber,
        roomNumber: rc.roomNumber,
        department: rc.department,
        year: rc.year,
        dates: {}
      };
    }
    studentsMap[rc.registerNumber].dates[rc.date] = rc;
  });

  const studentsList = Object.values(studentsMap).filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.name && s.name.toLowerCase().includes(q)) || 
           (s.registerNumber && s.registerNumber.toLowerCase().includes(q)) || 
           (s.roomNumber && s.roomNumber.toLowerCase().includes(q));
  });

  const filteredData = rollCallData.filter(rc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (rc.studentName && rc.studentName.toLowerCase().includes(q)) ||
      (rc.registerNumber && rc.registerNumber.toLowerCase().includes(q)) ||
      (rc.roomNumber && rc.roomNumber.toLowerCase().includes(q))
    );
  });

  // Get distinct dates for the grid headers (last 14 days)
  const gridDates = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    gridDates.push(d.toISOString().split('T')[0]);
  }

  // Generate days in month for active student's wall calendar
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

  const handleExport = () => {
    if (rollCallData.length === 0) return toast.error('No records to export');
    
    const exportData = rollCallData.map(rc => ({
      Date: rc.date,
      'Register No.': rc.registerNumber,
      Name: rc.studentName,
      Department: rc.department || '-',
      Year: rc.year || '-',
      Room: rc.roomNumber || '-',
      'Morning Status': rc.morningStatus,
      'Night Status': rc.nightStatus,
      'Out Time': rc.movementLog?.outTime ? new Date(rc.movementLog.outTime).toLocaleTimeString('en-IN') : '-',
      'In Time': rc.movementLog?.inTime ? new Date(rc.movementLog.inTime).toLocaleTimeString('en-IN') : '-',
      'Duration (Mins)': rc.movementLog?.durationMinutes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RollCall');
    XLSX.writeFile(workbook, `Hostel_RollCall_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Attendance report exported!');
  };

  const activeStudentInfo = studentsMap[activeStudentReg] || null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiCheckSquare className="text-blue-400" /> Attendance Roll-Call Register
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Daily morning check (8:00 AM) & night roll-call (9:00 PM) tracker
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* View Mode Toggle Buttons */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <FiCalendar className="w-3.5 h-3.5" /> Calendar View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <FiList className="w-3.5 h-3.5" /> Register Sheet
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Flat Table
              </button>
            </div>
            
            <button
              onClick={fetchRollCall}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 transition-all"
            >
              <FiDownload className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student name, room..."
                className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
            >
              {YEARS.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
            </select>

            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
            >
              {DEPTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
            </select>
          </div>
        </div>

        {/* Attendance Views */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner text="Loading register sheet..." /></div>
          ) : (
            <>
              {/* 1. CALENDAR MONTH VIEW (WALL CALENDAR FORMAT) */}
              {viewMode === 'calendar' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                >
                  {/* Left Student List Selector */}
                  <div className="glass-card p-4 space-y-3 lg:col-span-1 max-h-[600px] overflow-y-auto">
                    <h3 className="text-white text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-2">Students</h3>
                    <div className="space-y-1">
                      {studentsList.map(st => (
                        <button
                          key={st.registerNumber}
                          onClick={() => setActiveStudentReg(st.registerNumber)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                            activeStudentReg === st.registerNumber
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{st.name}</p>
                            <p className={`text-[10px] font-mono mt-0.5 ${activeStudentReg === st.registerNumber ? 'text-blue-200' : 'text-gray-500'}`}>{st.registerNumber}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${activeStudentReg === st.registerNumber ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            Room {st.roomNumber}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Calendar Grid Sheet */}
                  <div className="glass-card p-5 lg:col-span-3 space-y-4">
                    {activeStudentInfo ? (
                      <>
                        {/* Calendar Header Controls */}
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                          <div>
                            <h2 className="text-white font-bold text-lg">{activeStudentInfo.name}</h2>
                            <p className="text-xs text-gray-400 font-mono">{activeStudentInfo.registerNumber} | Room {activeStudentInfo.roomNumber} | {activeStudentInfo.department} - {activeStudentInfo.year}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-xl">
                            <button onClick={handlePrevMonth} className="text-gray-400 hover:text-white"><FiChevronLeft className="w-4 h-4" /></button>
                            <span className="text-xs font-bold text-white min-w-[100px] text-center">{monthNames[currentMonth]} {currentYear}</span>
                            <button onClick={handleNextMonth} className="text-gray-400 hover:text-white"><FiChevronRight className="w-4 h-4" /></button>
                          </div>
                        </div>

                        {/* Calendar Legends */}
                        <div className="flex flex-wrap gap-4 text-[10px] text-gray-400">
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded flex items-center justify-center font-bold text-[8px]">✔</span> Present</div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded flex items-center justify-center font-bold text-[8px]">✘</span> Absent</div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded flex items-center justify-center font-bold text-[8px]">✈</span> Native Leave</div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded flex items-center justify-center font-bold text-[8px]">⏱</span> Permission</div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded flex items-center justify-center font-bold text-[8px]">⚠️</span> Late Return</div>
                        </div>

                        {/* Wall Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                          {/* Day Labels */}
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
                          ))}

                          {/* Empty padding blocks */}
                          {Array.from({ length: firstDayIndex }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="bg-gray-900/10 border border-gray-800/10 rounded-xl min-h-[90px]" />
                          ))}

                          {/* Days in Month */}
                          {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const dayNumber = idx + 1;
                            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                            const dailyRecord = activeStudentInfo.dates[dateStr];
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;

                             return (
                               <div
                                 key={dateStr}
                                 className={`border rounded-xl p-3 min-h-[95px] flex flex-col justify-between transition-all relative ${
                                   isToday 
                                     ? 'bg-blue-950/20 border-blue-500 shadow-lg shadow-blue-500/5' 
                                     : dailyRecord 
                                       ? 'bg-gray-900/40 border-gray-800/80 hover:border-gray-700/60' 
                                       : 'bg-gray-950/20 border-gray-900/50 opacity-40'
                                 }`}
                               >
                                 <div className="flex items-center justify-between">
                                   <span className={`text-xs font-bold font-mono ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
                                     {dayNumber}
                                     {isToday && <span className="ml-1 text-[8px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded font-sans uppercase">Today</span>}
                                   </span>
                                   
                                   {dailyRecord && (
                                     <div className="flex items-center gap-1.5">
                                       {/* Morning Sun Badge */}
                                       <button
                                         onClick={() => handleToggleStatus(dailyRecord._id, 'morningStatus', dailyRecord.morningStatus)}
                                         className={`w-7 h-7 rounded-full border flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 ${getStatusBg(dailyRecord.morningStatus)}`}
                                         title={`Morning Check: ${dailyRecord.morningStatus}. Click to toggle.`}
                                       >
                                         <FiSun className="w-2.5 h-2.5" />
                                         <span className="text-[7px] font-extrabold mt-0.5 leading-none">{getStatusIcon(dailyRecord.morningStatus)}</span>
                                       </button>

                                       {/* Night Moon Badge */}
                                       <button
                                         onClick={() => handleToggleStatus(dailyRecord._id, 'nightStatus', dailyRecord.nightStatus)}
                                         className={`w-7 h-7 rounded-full border flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 ${getStatusBg(dailyRecord.nightStatus)}`}
                                         title={`Night Check: ${dailyRecord.nightStatus}. Click to toggle.`}
                                       >
                                         <FiMoon className="w-2.5 h-2.5" />
                                         <span className="text-[7px] font-extrabold mt-0.5 leading-none">{getStatusIcon(dailyRecord.nightStatus)}</span>
                                       </button>
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
                      </>
                    ) : (
                      <div className="py-20 text-center text-gray-500 text-sm">Please register students to view calendar register</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 2. REGISTER GRID SHEET (COMPACT CLASS REGISTER FORMAT) */}
              {viewMode === 'grid' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-4 overflow-hidden border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                    <h3 className="text-white font-bold text-sm">Class Attendance Register (Last 14 Days)</h3>
                    <div className="flex gap-4 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1"><span className="text-emerald-500">M</span> = Morning</div>
                      <div className="flex items-center gap-1"><span className="text-indigo-400">N</span> = Night</div>
                    </div>
                  </div>
                  
                  <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-xs min-w-[1200px] border-collapse">
                      <thead>
                        <tr className="bg-gray-800/80">
                          <th className="px-3 py-2.5 text-left font-semibold text-gray-400 uppercase w-32 sticky left-0 bg-gray-900 z-10">Student Details</th>
                          {gridDates.map(date => {
                            const displayDate = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                            return (
                              <th key={date} className="px-2 py-2 text-center font-semibold text-gray-400 border border-gray-800/60 font-mono w-24">
                                {displayDate}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/30">
                        {studentsList.map(st => (
                          <tr key={st.registerNumber} className="hover:bg-gray-800/20 transition-colors">
                            {/* Student Info Card Sticked Left */}
                            <td className="px-3 py-2.5 font-medium text-white sticky left-0 bg-gray-900 shadow-md border-r border-gray-800/80 w-32">
                              <p className="font-semibold truncate">{st.name}</p>
                              <p className="text-[10px] font-mono text-blue-400 mt-0.5 truncate">{st.registerNumber}</p>
                              <p className="text-[9px] text-gray-500 truncate">Room: {st.roomNumber}</p>
                            </td>

                            {/* Dates Grid Columns */}
                            {gridDates.map(dateStr => {
                              const rc = st.dates[dateStr];
                              return (
                                <td key={dateStr} className="px-1.5 py-2 border border-gray-800/50 text-center font-mono">
                                  {rc ? (
                                    <div className="flex flex-col gap-1 items-center justify-center">
                                      {/* Morning Check */}
                                      <div
                                        onClick={() => handleToggleStatus(rc._id, 'morningStatus', rc.morningStatus)}
                                        className={`w-full py-0.5 px-1 rounded text-[9px] font-bold border flex items-center justify-center gap-1 cursor-pointer select-none transition-all hover:scale-105 ${getStatusBg(rc.morningStatus)}`}
                                        title={`Morning Check: ${rc.morningStatus}. Click to toggle.`}
                                      >
                                        <span>M:</span>
                                        {getStatusIcon(rc.morningStatus)}
                                      </div>
                                      
                                      {/* Night Check */}
                                      <div
                                        onClick={() => handleToggleStatus(rc._id, 'nightStatus', rc.nightStatus)}
                                        className={`w-full py-0.5 px-1 rounded text-[9px] font-bold border flex items-center justify-center gap-1 cursor-pointer select-none transition-all hover:scale-105 ${getStatusBg(rc.nightStatus)}`}
                                        title={`Night Check: ${rc.nightStatus}. Click to toggle.`}
                                      >
                                        <span>N:</span>
                                        {getStatusIcon(rc.nightStatus)}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-700">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* 3. FLAT TABLE VIEW */}
              {viewMode === 'table' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-card overflow-hidden"
                >
                  <div className="overflow-auto">
                    <table className="w-full text-sm min-w-[850px]">
                      <thead>
                        <tr className="bg-gray-800/80">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Register No.</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Room</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Morning (8 AM)</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Night (9 PM)</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Gate Movement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {filteredData.map((rc, i) => (
                          <tr key={rc._id || i} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-gray-300 font-semibold">{rc.date}</td>
                            <td className="px-4 py-3 font-mono text-blue-400 text-xs font-medium">{rc.registerNumber}</td>
                            <td className="px-4 py-3 text-white text-sm font-medium">{rc.studentName}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs font-mono">{rc.roomNumber || '-'}</td>
                            <td className="px-4 py-3 text-xs">
                              <button
                                onClick={() => handleToggleStatus(rc._id, 'morningStatus', rc.morningStatus)}
                                className={`px-3 py-1 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition-all hover:scale-105 ${getStatusBg(rc.morningStatus)}`}
                              >
                                <FiSun className="w-3.5 h-3.5" />
                                {rc.morningStatus}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <button
                                onClick={() => handleToggleStatus(rc._id, 'nightStatus', rc.nightStatus)}
                                className={`px-3 py-1 rounded-lg border font-semibold text-xs flex items-center gap-1.5 transition-all hover:scale-105 ${getStatusBg(rc.nightStatus)}`}
                              >
                                <FiMoon className="w-3.5 h-3.5" />
                                {rc.nightStatus}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-400">
                              {rc.movementLog ? (
                                <div>
                                  <span className="text-gray-300 capitalize">{rc.movementLog.movementType}:</span>{' '}
                                  <span className="text-amber-400">{new Date(rc.movementLog.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                  {rc.movementLog.inTime ? (
                                    <span> $\rightarrow$ <span className="text-emerald-400">{new Date(rc.movementLog.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span> ({rc.movementLog.durationMinutes}m)</span>
                                  ) : (
                                    <span className="text-red-400"> (Still Outside)</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">No Gate Exit</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default WardenAttendancePage;
