import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiHome, FiLogOut, FiAlertTriangle,
  FiClock, FiCalendar, FiLogIn, FiTrendingUp, FiBell, FiRefreshCw, FiDownload
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/common/StatCard';
import LiveStatusTable from '../components/tables/LiveStatusTable';
import { DailyAttendanceChart, WeeklyTrendChart, StatusPieChart } from '../components/charts/AttendanceChart';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import * as XLSX from 'xlsx';
import { getPendingLeaves, approveLeave, rejectLeave } from '../services/leaveService';
import { getEmergencyHistory, getPendingPermissions, approveStaffPermission, rejectStaffPermission } from '../services/permissionService';
import { exportReport } from '../services/reportService';
import { useAuth } from '../context/AuthContext';

const LATE_FILTER_OPTIONS = [
  { key: 'today', label: 'Today', field: 'lateToday' },
  { key: 'week', label: 'This Week', field: 'lateThisWeek' },
  { key: 'month', label: 'This Month', field: 'lateThisMonth' },
];

const WardenDashboard = () => {
  const { user } = useAuth();
  const { stats, liveStatus, outside, chartData, loading, error, refetch } = useDashboard(30000);
  const [lateFilter, setLateFilter] = useState('today');
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingStaffPermissions, setPendingStaffPermissions] = useState([]);

  // Custom states for warden@gmail.com
  const [selectedYear, setSelectedYear] = useState('All');
  const [officeSearch, setOfficeSearch] = useState('');
  const [officeStatusFilter, setOfficeStatusFilter] = useState('All');

  // Emergency States
  const [emergencyFilter, setEmergencyFilter] = useState('today');
  const [emergencyHistory, setEmergencyHistory] = useState([]);

  const fetchPending = async () => {
    if (user?.role === 'admin-mess') return;
    try {
      const res = await getPendingLeaves();
      setPendingLeaves(res.data.data.leaves || []);
    } catch {}
  };

  const fetchPendingStaff = async () => {
    if (user?.role === 'admin-mess') return;
    try {
      const res = await getPendingPermissions();
      setPendingStaffPermissions(res.data.data.permissions || []);
    } catch {}
  };

  const fetchEmergencyHistory = async () => {
    if (user?.role === 'admin-mess') return;
    try {
      const res = await getEmergencyHistory({ filter: emergencyFilter });
      setEmergencyHistory(res.data.data.history || []);
    } catch {}
  };

  useEffect(() => {
    fetchPending();
    fetchPendingStaff();
  }, []);

  useEffect(() => {
    fetchEmergencyHistory();
  }, [emergencyFilter]);

  const handleRefresh = async () => {
    await refetch();
    await fetchPending();
    await fetchPendingStaff();
    await fetchEmergencyHistory();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const isOfficeWarden = user?.email === 'warden@gmail.com';

  // Render for Office Warden (warden@gmail.com)
  if (isOfficeWarden) {
    const yearStudents = selectedYear === 'All' ? liveStatus : liveStatus.filter(s => s.year === selectedYear);
    const totalInYear = yearStudents.length;
    const insideInYear = yearStudents.filter(s => s.currentStatus === 'Inside').length;
    const outsideInYear = yearStudents.filter(s => s.currentStatus === 'Outside').length;
    const permissionInYear = yearStudents.filter(s => s.currentStatus === 'Permission').length;
    const nativeLeaveInYear = yearStudents.filter(s => s.currentStatus === 'NativeLeave').length;

    const officeFilteredStudents = liveStatus.filter(s => {
      if (selectedYear !== 'All' && s.year !== selectedYear) return false;
      if (officeStatusFilter !== 'All' && s.currentStatus !== officeStatusFilter) return false;
      if (officeSearch) {
        const q = officeSearch.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.registerNumber.toLowerCase().includes(q) ||
          s.roomNumber.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const handleExportExcel = () => {
      if (officeFilteredStudents.length === 0) {
        return toast.error('No student data to export');
      }

      const dataToExport = officeFilteredStudents.map(student => ({
        'Register Number': student.registerNumber,
        'Name': student.name,
        'Year': student.year,
        'Room Number': student.roomNumber,
        'Department': student.department,
        'Phone': student.studentPhone || '-',
        'Status': student.currentStatus
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      
      const fileName = selectedYear === 'All' 
        ? 'Overall_Hostel_Students_Report.xlsx'
        : `${selectedYear.replace(' ', '_')}_Hostel_Students_Report.xlsx`;

      XLSX.writeFile(workbook, fileName);
      toast.success('Excel report downloaded successfully!');
    };

    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Warden Office Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white rounded-xl text-sm transition-all hover:bg-gray-700/60 w-full sm:w-auto"
            >
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {/* Year Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-gray-900 border border-gray-800/50 rounded-2xl max-w-2xl">
            {['All', '1st Year', '2nd Year', '3rd Year', '4th Year'].map((yearOption) => (
              <button
                key={yearOption}
                onClick={() => {
                  setSelectedYear(yearOption);
                  setOfficeStatusFilter('All');
                }}
                className={`flex-1 min-w-[80px] text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedYear === yearOption
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {yearOption === 'All' ? 'Overall (All)' : yearOption}
              </button>
            ))}
          </div>

          {/* Key Stats for Selected Year */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={FiUsers}
              label="Total Students"
              value={totalInYear}
              color="blue"
              index={0}
              onClick={() => setOfficeStatusFilter('All')}
            />
            <StatCard
              icon={FiHome}
              label="Inside"
              value={insideInYear}
              color="emerald"
              index={1}
              onClick={() => setOfficeStatusFilter('Inside')}
            />
            <StatCard
              icon={FiLogOut}
              label="Outside"
              value={outsideInYear}
              color="amber"
              index={2}
              onClick={() => setOfficeStatusFilter('Outside')}
            />
            <StatCard
              icon={FiClock}
              label="Permission"
              value={permissionInYear}
              color="cyan"
              index={3}
              onClick={() => setOfficeStatusFilter('Permission')}
            />
            <StatCard
              icon={FiCalendar}
              label="Native Leave"
              value={nativeLeaveInYear}
              color="purple"
              index={4}
              onClick={() => setOfficeStatusFilter('NativeLeave')}
            />
          </div>

          {/* Students List section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800/40 pb-4">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
                  {selectedYear === 'All' ? 'Overall Hostel' : selectedYear} Students
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                    {officeFilteredStudents.length}
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Currently filtered by: <span className="text-blue-400 font-semibold">{officeStatusFilter}</span></p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={officeSearch}
                    onChange={(e) => setOfficeSearch(e.target.value)}
                    placeholder="Search name, register no..."
                    className="w-full pl-3 pr-8 py-2 bg-gray-950 border border-gray-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  {officeSearch && (
                    <button
                      onClick={() => setOfficeSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Status selector */}
                <select
                  value={officeStatusFilter}
                  onChange={(e) => setOfficeStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none flex-1 sm:flex-initial"
                >
                  <option value="All">All Statuses</option>
                  <option value="Inside">Inside</option>
                  <option value="Outside">Outside</option>
                  <option value="Permission">Permission</option>
                  <option value="NativeLeave">Native Leave</option>
                </select>

                {/* Excel Export Button */}
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20"
                >
                  <FiDownload className="w-3.5 h-3.5" /> Export Excel
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-auto rounded-xl border border-gray-800/50">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-3 text-left text-xs text-gray-400 font-semibold uppercase tracking-wider">Register No.</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 font-semibold uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 font-semibold uppercase tracking-wider">Room</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 font-semibold uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 font-semibold uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {officeFilteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-400 text-xs font-medium">{s.registerNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <span className="text-white text-sm font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs font-mono">{s.roomNumber}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{s.department}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.studentPhone || '-'}</td>
                      <td className="px-4 py-3 text-xs">
                        <Badge status={s.currentStatus} />
                      </td>
                    </tr>
                  ))}
                  {officeFilteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">No matching students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }



  const activeLateCount = stats
    ? (lateFilter === 'today' ? stats.lateToday : lateFilter === 'week' ? stats.lateThisWeek : stats.lateThisMonth) ?? 0
    : 0;

  const pieData = stats ? [
    { name: 'Inside', value: stats.inside || 0 },
    { name: 'Outside', value: stats.outside || 0 },
    { name: 'Permission', value: stats.permission || 0 },
    { name: 'NativeLeave', value: stats.nativeLeave || 0 },
    { name: 'Late Today', value: stats.lateToday || 0 },
  ].filter(d => d.value > 0) : [];

  // Separate NOT_RETURNED students from "outside" list
  const notReturnedStudents = outside.filter(r => {
    if (!r.outTime) return false;
    const outTime = new Date(r.outTime);
    const now = new Date();
    const minOut = Math.floor((now - outTime) / 60000);

    // Flag as "not returned" if out for more than 30 minutes on an evening/dinner outing
    const isCurfewType = r.movementType === 'EveningOuting' || r.movementType === 'DinnerBreak';
    if (isCurfewType) return true;

    // Flag permission overdue
    if (r.permissionUntil && new Date(r.permissionUntil) < now) return true;

    return false;
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white rounded-xl text-sm transition-all hover:bg-gray-700/60"
          >
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label="Total Students" value={stats?.totalStudents} color="blue" index={0} />
          <StatCard icon={FiHome} label="Inside Hostel" value={stats?.inside} color="emerald" index={1} />
          <StatCard icon={FiLogOut} label="Outside Now" value={stats?.outside} color="amber" index={2} />
          <StatCard icon={FiAlertTriangle} label="Not Returned" value={stats?.notReturned} color="red" index={3} />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiClock} label="On Permission" value={stats?.permission} color="blue" index={4} />
          <StatCard icon={FiCalendar} label="Native Leave" value={stats?.nativeLeave} color="purple" index={5} />
          <StatCard icon={FiLogOut} label="Today's OUT" value={stats?.todayOut} color="orange" index={6} />
          <StatCard icon={FiLogIn} label="Today's IN" value={stats?.todayIn} color="cyan" index={7} />
        </div>

        {/* Late Comers section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 text-red-400" /> Late Comers
              {activeLateCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-full">
                  {activeLateCount}
                </span>
              )}
            </h3>
            <div className="flex gap-1.5 p-1 bg-gray-800/60 border border-gray-700/50 rounded-xl">
              {LATE_FILTER_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setLateFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    lateFilter === key
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {activeLateCount === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              ✅ No late comers {lateFilter === 'today' ? 'today' : lateFilter === 'week' ? 'this week' : 'this month'}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-red-300 text-sm font-medium">
                {activeLateCount} student{activeLateCount !== 1 ? 's' : ''} returned late{' '}
                {lateFilter === 'today' ? 'today' : lateFilter === 'week' ? 'in the last 7 days' : 'in the last 30 days'}.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Go to <span className="text-blue-400">Reports → Late Comers</span> for a detailed export.
              </p>
            </div>
          )}
        </motion.div>

        {/* Students Not Returned Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="glass-card p-5 border border-amber-500/20"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-amber-400 w-4 h-4" />
            Students Not Returned
            {outside.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-full">
                {outside.length}
              </span>
            )}
          </h3>
          {outside.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              🏠 All students are currently inside
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-gray-800/50">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Register No.</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Type</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Out Time</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Duration</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {outside.map(r => {
                    const outTime = new Date(r.outTime);
                    const now = new Date();
                    const minOut = Math.floor((now - outTime) / 60000);
                    const hoursOut = Math.floor(minOut / 60);
                    const minsRemainder = minOut % 60;
                    const durationLabel = hoursOut > 0
                      ? `${hoursOut}h ${minsRemainder}m`
                      : `${minOut}m`;

                    const isOverdue = r.permissionUntil && new Date(r.permissionUntil) < now;
                    const isEveningClosed = r.movementType === 'EveningOuting' && now.getHours() >= 18 && now.getMinutes() >= 30;
                    const isDinnerClosed = r.movementType === 'DinnerBreak' && now.getHours() >= 21;
                    const isLateStatus = isOverdue || isEveningClosed || isDinnerClosed;

                    return (
                      <tr key={r._id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-blue-400 text-xs font-medium">{r.registerNumber}</td>
                        <td className="px-4 py-2.5 text-white text-sm">{r.studentName}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{r.movementType}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">
                          {outTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          <span className={`font-semibold ${minOut > 60 ? 'text-red-400' : 'text-amber-400'}`}>
                            {durationLabel}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs">
                          {isLateStatus ? (
                            <span className="px-2 py-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg font-semibold">
                              ⚠️ Overdue
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg font-semibold">
                              Outside
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pending Native Leaves Approval */}
        {pendingLeaves.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 border border-purple-500/20"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FiCalendar className="text-purple-400 w-4 h-4" />
              Pending Native Leave Requests
              <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold rounded-full">
                {pendingLeaves.length}
              </span>
            </h3>
            <div className="overflow-auto rounded-xl border border-gray-800/50">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Register No.</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">From Date</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">To Date</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Reason</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {pendingLeaves.map(l => (
                    <tr key={l._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-blue-400 text-xs font-medium">{l.registerNumber}</td>
                      <td className="px-4 py-2.5 text-white text-sm">{l.studentName}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{new Date(l.fromDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">
                        {new Date(l.toDate).toLocaleDateString('en-IN')}{' '}
                        {(() => {
                          const diffDays = Math.round((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24));
                          const isLateDeparture = l.outTimeSeason === 'Evening' || l.outTimeSeason === 'Night';
                          const days = Math.max(1, isLateDeparture ? diffDays - 1 : diffDays);
                          return <span className="text-purple-400">({days}d)</span>;
                        })()}
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[120px] truncate">{l.reason}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await approveLeave(l._id);
                                toast.success('Leave request approved');
                                fetchPending();
                              } catch { toast.error('Failed to approve'); }
                            }}
                            className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-bold transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await rejectLeave(l._id);
                                toast.success('Leave request rejected');
                                fetchPending();
                              } catch { toast.error('Failed to reject'); }
                            }}
                            className="px-2.5 py-1 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 rounded-lg font-bold transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {/* Pending Staff Permissions Approval */}
        {pendingStaffPermissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 border border-blue-500/20"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FiClock className="text-blue-400 w-4 h-4" />
              Pending Staff Permission Requests
              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full">
                {pendingStaffPermissions.length}
              </span>
            </h3>
            <div className="overflow-auto rounded-xl border border-gray-800/50">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Register No.</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Date</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">From Time</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">To Time</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Reason</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {pendingStaffPermissions.map(p => (
                    <tr key={p._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-blue-400 text-xs font-medium">{p.registerNumber}</td>
                      <td className="px-4 py-2.5 text-white text-sm">{p.studentName}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{new Date(p.permissionStartTime).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{new Date(p.permissionStartTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{new Date(p.permissionEndTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[120px] truncate">{p.reason}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await approveStaffPermission(p._id);
                                toast.success('Staff permission approved');
                                fetchPendingStaff();
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
                                toast.success('Staff permission rejected');
                                fetchPendingStaff();
                              } catch { toast.error('Failed to reject'); }
                            }}
                            className="px-2.5 py-1 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 rounded-lg font-bold transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 lg:col-span-2"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-blue-400 w-4 h-4" /> Weekly Movement Trend
            </h3>
            <WeeklyTrendChart data={chartData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FiUsers className="text-blue-400 w-4 h-4" /> Live Distribution
            </h3>
            {pieData.length > 0 ? (
              <StatusPieChart data={pieData} />
            ) : (
              <div className="h-60 flex items-center justify-center text-gray-500 text-sm">No data yet</div>
            )}
          </motion.div>
        </div>

        {/* Daily chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-400 w-4 h-4" /> 7-Day Daily Attendance
          </h3>
          <DailyAttendanceChart data={chartData} />
        </motion.div>

        {/* Emergency Permission History */}
        {user?.role !== 'admin-mess' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FiAlertTriangle className="text-red-400 w-4 h-4" />
                  Emergency Permission History
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Logs of all student emergency checkout attempts</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
                  {['today', 'week', 'month'].map(f => (
                    <button
                      key={f}
                      onClick={() => setEmergencyFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                        emergencyFilter === f ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-auto rounded-xl border border-gray-800/50">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Register No.</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Time</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Reason</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Warden</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Decision</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Checkout Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {emergencyHistory.map(e => (
                    <tr key={e._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-blue-400 text-xs font-medium">{e.registerNumber}</td>
                      <td className="px-4 py-2.5 text-white text-sm">{e.studentName}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{e.date} {e.time}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[120px] truncate">{e.reason}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{e.wardenName || '-'}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          e.wardenDecision === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {e.wardenDecision}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">
                        {e.outTime ? new Date(e.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                    </tr>
                  ))}
                  {emergencyHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">No emergency records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Live status table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FiUsers className="text-blue-400 w-4 h-4" /> All Students — Live Status
          </h3>
          <LiveStatusTable students={liveStatus} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WardenDashboard;
