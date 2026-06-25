import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiHome, FiLogOut, FiAlertTriangle,
  FiClock, FiCalendar, FiLogIn, FiTrendingUp, FiBell, FiRefreshCw
} from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/common/StatCard';
import LiveStatusTable from '../components/tables/LiveStatusTable';
import { DailyAttendanceChart, WeeklyTrendChart, StatusPieChart } from '../components/charts/AttendanceChart';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WardenDashboard = () => {
  const { stats, liveStatus, outside, chartData, loading, error, refetch } = useDashboard(30000);
  const [activeTab, setActiveTab] = useState('all');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  const pieData = stats ? [
    { name: 'Inside', value: stats.inside || 0 },
    { name: 'Outside', value: stats.outside || 0 },
    { name: 'Permission', value: stats.permission || 0 },
    { name: 'NativeLeave', value: stats.nativeLeave || 0 },
    { name: 'Late Today', value: stats.lateToday || 0 },
  ].filter(d => d.value > 0) : [];

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
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white rounded-xl text-sm transition-all hover:bg-gray-700/60"
          >
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label="Total Students" value={stats?.totalStudents} color="blue" index={0} />
          <StatCard icon={FiHome} label="Inside Hostel" value={stats?.inside} color="emerald" index={1} />
          <StatCard icon={FiLogOut} label="Outside Now" value={stats?.outside} color="amber" index={2} />
          <StatCard icon={FiAlertTriangle} label="Late Today" value={stats?.lateToday} color="red" index={3} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiClock} label="On Permission" value={stats?.permission} color="blue" index={4} />
          <StatCard icon={FiCalendar} label="Native Leave" value={stats?.nativeLeave} color="purple" index={5} />
          <StatCard icon={FiLogOut} label="Today's OUT" value={stats?.todayOut} color="orange" index={6} />
          <StatCard icon={FiLogIn} label="Today's IN" value={stats?.todayIn} color="cyan" index={7} />
        </div>

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

        {/* Currently outside alert */}
        {outside.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5 border-amber-500/20"
          >
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <FiAlertTriangle className="text-amber-400 w-4 h-4" /> Students Currently Outside ({outside.length})
            </h3>
            <div className="overflow-auto rounded-xl border border-gray-800/50">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Register No.</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Type</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Out Time</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-400 font-semibold">Permission Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {outside.map(r => {
                    const outTime = new Date(r.outTime);
                    const now = new Date();
                    const minOut = Math.floor((now - outTime) / 60000);
                    return (
                      <tr key={r._id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-blue-400 text-xs font-medium">{r.registerNumber}</td>
                        <td className="px-4 py-2.5 text-white text-sm">{r.studentName}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{r.movementType}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">
                          {outTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          <span className="ml-1 text-amber-400">({minOut}m ago)</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-400">
                          {r.permissionUntil
                            ? new Date(r.permissionUntil).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
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
