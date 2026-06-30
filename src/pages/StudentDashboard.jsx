import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiClock, FiCalendar, FiAlertTriangle,
  FiBookOpen, FiFileText, FiRefreshCw, FiHome, FiTrendingUp, FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getStudentDashboardStats } from '../services/movementService';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getStudentDashboardStats();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="py-24 flex justify-center"><LoadingSpinner text="Loading your dashboard..." /></div>
      </StudentDashboardLayout>
    );
  }

  const { stats = {}, recentActivity = [], calendarData = [] } = data || {};

  // Simple Month Days calculation for Calendar view
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🚀 My Dashboard
            </h1>
            <p className="text-xs text-gray-400">Track your attendance and movement activities</p>
          </div>
          <button
            onClick={fetchStats}
            className="p-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition-all"
            title="Refresh Stats"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Current status banner */}
        <div className={`p-4 rounded-2xl border transition-all ${
          stats.currentStatus === 'Inside'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : stats.currentStatus === 'NativeLeave'
            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            : stats.currentStatus === 'Permission'
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <div>
                <p className="text-xs opacity-75">Your Current Status</p>
                <p className="text-base font-bold capitalize mt-0.5">{stats.currentStatus} Hostel</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/40">Live Status</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total OUT', val: stats.totalOut, color: 'text-blue-400' },
            { label: 'Total IN', val: stats.totalIn, color: 'text-emerald-400' },
            { label: 'Staff Perms', val: stats.staffPermissions, color: 'text-amber-400' },
            { label: 'Native Leaves', val: stats.nativeLeaves, color: 'text-purple-400' },
            { label: 'Emergency', val: stats.emergencyPermissions, color: 'text-red-400' },
            { label: 'Late Returns', val: stats.lateReturns, color: 'text-rose-500' },
          ].map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 text-center space-y-1.5"
            >
              <p className="text-gray-400 text-xs font-medium">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="glass-card p-5 lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FiCalendar className="text-emerald-400 w-4 h-4" />
                Attendance Calendar
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-1.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-semibold transition-all">◀</button>
                <span className="text-white text-xs font-bold capitalize font-mono">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="p-1.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-semibold transition-all">▶</button>
              </div>
            </div>

            {/* Colors legend */}
            <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 pt-1 pb-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Attendance</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Permission</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Native Leave</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Emergency</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Late Return</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-gray-500 font-mono">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDay }).map((_, idx) => <div key={`empty-${idx}`}></div>)}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const day = idx + 1;
                const formattedDay = day < 10 ? `0${day}` : `${day}`;
                const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
                const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

                // Find matching activities
                const dayActivities = calendarData.filter(c => c.date === dateKey);
                let colorClass = 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600';
                
                if (dayActivities.length > 0) {
                  const types = dayActivities.map(d => d.type);
                  if (types.includes('late')) colorClass = 'bg-red-500/20 border border-red-500/50 text-red-400 font-bold';
                  else if (types.includes('emergency')) colorClass = 'bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold';
                  else if (types.includes('leave')) colorClass = 'bg-blue-500/20 border border-blue-500/50 text-blue-400 font-bold';
                  else if (types.includes('permission')) colorClass = 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-bold';
                  else colorClass = 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold';
                }

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (dayActivities.length > 0) {
                        setSelectedDay({ day, activities: dayActivities });
                      } else {
                        setSelectedDay(null);
                      }
                    }}
                    className={`h-9 w-full rounded-lg transition-all flex items-center justify-center text-xs font-semibold font-mono ${colorClass}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-gray-900/60 border border-gray-800 rounded-xl space-y-2 text-xs"
                >
                  <p className="text-gray-400 font-bold">Activities on {selectedDay.day} {currentMonth.toLocaleString('default', { month: 'long' })}:</p>
                  <ul className="space-y-1">
                    {selectedDay.activities.map((act, i) => (
                      <li key={i} className="text-white flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          act.type === 'late' ? 'bg-red-500' :
                          act.type === 'emergency' ? 'bg-purple-500' :
                          act.type === 'leave' ? 'bg-blue-500' :
                          act.type === 'permission' ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}></span>
                        {act.details}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Activity */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400 w-4 h-4" />
              Recent Activities
            </h3>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {recentActivity.map((r, i) => (
                <div key={r._id || i} className="p-3 bg-gray-900/40 border border-gray-800/50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                      r.movementType === 'NativeLeave' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      r.movementType === 'StaffPermission' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                      r.movementType === 'EmergencyPermission' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {r.movementType}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(r.outTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-gray-400">Reason: <strong className="text-white font-normal">{r.reason || 'None'}</strong></p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    OUT: {new Date(r.outTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {r.inTime ? ` | IN: ${new Date(r.inTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ' | (Outside)'}
                  </p>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="py-12 text-center text-gray-500 text-xs">No recent movement records found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentDashboard;
