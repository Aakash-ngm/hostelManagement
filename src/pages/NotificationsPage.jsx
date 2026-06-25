import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheckCircle, FiTrash2, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getNotifications, markRead, markAllRead, clearAll } from '../services/notificationService';

const iconMap = {
  LateReturn: { icon: FiAlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  PermissionExpiry: { icon: FiAlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  NotReturned: { icon: FiAlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  NativeLeave: { icon: FiInfo, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  General: { icon: FiInfo, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const res = await getNotifications({ limit: 50 });
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleMarkRead = async (id) => {
    await markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  const handleClear = async () => {
    await clearAll();
    setNotifications(prev => prev.filter(n => !n.isRead));
    toast.success('Read notifications cleared');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiBell className="w-6 h-6 text-blue-400" /> Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{unreadCount}</span>
              )}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Hostel alerts and student notifications</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="btn-secondary text-xs px-3 py-2 flex items-center justify-center gap-1.5 flex-1 sm:flex-none">
                <FiCheckCircle className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button onClick={handleClear} className="btn-danger text-xs px-3 py-2 flex items-center justify-center gap-1.5 flex-1 sm:flex-none">
              <FiTrash2 className="w-3.5 h-3.5" /> Clear read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner text="Loading notifications..." /></div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <FiBell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No notifications</p>
            <p className="text-gray-600 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const { icon: Icon, color, bg } = iconMap[n.type] || iconMap.General;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass-card p-4 flex items-start gap-4 transition-all ${n.isRead ? 'opacity-60' : 'border-l-2 border-l-blue-500'}`}
                >
                  <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.isRead ? 'text-gray-400' : 'text-white'}`}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                      {n.registerNumber && <span className="text-xs font-mono text-blue-400">{n.registerNumber}</span>}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
