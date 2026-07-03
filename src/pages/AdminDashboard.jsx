import { motion } from 'framer-motion';
import {
  FiUsers, FiHome, FiLogOut, FiCalendar, FiClock, FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/common/StatCard';
import LiveStatusTable from '../components/tables/LiveStatusTable';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { stats, liveStatus, loading, refetch } = useDashboard(30000);

  const handleRefresh = async () => {
    await refetch();
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mess & Attendance Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              Standard food counts are calculated based on students currently Inside the hostel.
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={FiUsers} label="Total Hostel Students" value={stats?.totalStudents} color="blue" index={0} />
          <StatCard icon={FiHome} label="Students Inside Hostel" value={stats?.inside} color="emerald" index={1} />
          <StatCard icon={FiLogOut} label="Students Outside Hostel" value={stats?.outside} color="amber" index={2} />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={FiCalendar} label="Students on Native Leave" value={stats?.nativeLeave} color="purple" index={3} />
          <StatCard icon={FiClock} label="Students on Staff Permission" value={stats?.permission} color="blue" index={4} />
          <StatCard icon={FiAlertTriangle} label="Students on Emergency Permission" value={stats?.emergencyPermission} color="red" index={5} />
        </div>

        {/* Meal Counts Heading */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">🍳 Today's Meal Planning</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 border border-emerald-500/10 bg-emerald-500/5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">🍳 Breakfast Count</p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{stats?.breakfastCount}</p>
              <p className="text-gray-500 text-xs mt-1">Time: 7:00 AM - 8:30 AM</p>
            </div>
            <div className="glass-card p-5 border border-blue-500/10 bg-blue-500/5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">🍛 Lunch Count</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats?.lunchCount}</p>
              <p className="text-gray-500 text-xs mt-1">Time: 12:30 PM - 2:00 PM</p>
            </div>
            <div className="glass-card p-5 border border-amber-500/10 bg-amber-500/5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">🍽️ Dinner Count</p>
              <p className="text-3xl font-bold text-amber-400 mt-2">{stats?.dinnerCount}</p>
              <p className="text-gray-500 text-xs mt-1">Time: 8:00 PM - 9:00 PM</p>
            </div>
          </div>
        </div>

        {/* Tomorrow's Meal Estimate */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">🔮 Tomorrow's Meal Estimate</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 border border-gray-800 bg-gray-900/40">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Breakfast Estimate</p>
              <p className="text-2xl font-bold text-white mt-2">{stats?.tomorrowBreakfast}</p>
              <p className="text-gray-500 text-xs mt-1">Based on leaves scheduled tomorrow</p>
            </div>
            <div className="glass-card p-5 border border-gray-800 bg-gray-900/40">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Lunch Estimate</p>
              <p className="text-2xl font-bold text-white mt-2">{stats?.tomorrowLunch}</p>
              <p className="text-gray-500 text-xs mt-1">Based on leaves scheduled tomorrow</p>
            </div>
            <div className="glass-card p-5 border border-gray-800 bg-gray-900/40">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Dinner Estimate</p>
              <p className="text-2xl font-bold text-white mt-2">{stats?.tomorrowDinner}</p>
              <p className="text-gray-500 text-xs mt-1">Based on leaves scheduled tomorrow</p>
            </div>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
          <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
            💡 Meal Exclusions Rule
          </p>
          <ul className="list-disc pl-5 text-gray-300 text-xs space-y-1">
            <li>Students currently on Native Leave are excluded from all meals.</li>
            <li>Students with approved staff permissions overlapping meal times are excluded from that meal count.</li>
            <li>Students outside on an active emergency permission are excluded from the current meal counts.</li>
          </ul>
        </div>

        {/* Student Status Directory */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-bold text-white mb-3">📋 Student Attendance & Status Directory</h2>
          <LiveStatusTable students={liveStatus} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
