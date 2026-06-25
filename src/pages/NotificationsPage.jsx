import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheckCircle, FiTrash2, FiAlertTriangle, FiInfo,
  FiAlertCircle, FiClock, FiHome, FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getNotifications, markRead, markAllRead, clearAll } from '../services/notificationService';

/* ── Icon & colour definitions for every alert type ── */
const iconMap = {
  // Legacy types
  LateReturn:          { icon: FiAlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Late Return' },
  PermissionExpiry:    { icon: FiAlertCircle,   color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Permission Expiry' },
  NotReturned:         { icon: FiAlertTriangle,  color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Not Returned' },
  NativeLeave:         { icon: FiHome,           color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Native Leave' },
  // New types
  LateComer:           { icon: FiAlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Late Comer' },
  StudentNotReturned:  { icon: FiAlertCircle,   color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Not Returned' },
  PermissionExpired:   { icon: FiClock,         color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Permission Expired' },
  ReturnedEarly:       { icon: FiHome,          color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Returned Early' },
  NewNativeLeaveRequest: { icon: FiCalendar,    color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Leave Request' },
  General:             { icon: FiInfo,          color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Info' },
};

const FILTER_OPTIONS = [
  { key: 'all',   label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async (activeFilter) => {
    try {
      const params = { limit: 100 };
      if (activeFilter !== 'all') params.filter = activeFilter;
      const res = await getNotifications(params);
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNotifications(filter);
  }, [filter, fetchNotifications]);

  const handleMarkRead = async (id) => {
    await markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read', isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read', isRead: true })));
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  const handleClear = async () => {
    await clearAll();
    // "Clear Read" marks all unread as read (does NOT delete)
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read', isRead: true })));
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const isUnread = (n) => n.status === 'unread' || (!n.status && !n.isRead);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiBell className="w-6 h-6 text-blue-400" /> Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Hostel alerts and student notifications</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="btn-secondary text-xs px-3 py-2 flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
              >
                <FiCheckCircle className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={handleClear}
              className="btn-danger text-xs px-3 py-2 flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Clear read
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 p-1 bg-gray-900/60 border border-gray-800/50 rounded-xl w-fit">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === key
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner text="Loading notifications..." />
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <FiBell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No notifications</p>
            <p className="text-gray-600 text-sm mt-1">
              {filter === 'all' ? "You're all caught up!" : `Nothing for ${FILTER_OPTIONS.find(f => f.key === filter)?.label}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {notifications.map((n, i) => {
                const typeData = iconMap[n.type] || iconMap.General;
                const { icon: Icon, color, bg, label } = typeData;
                const unread = isUnread(n);
                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.02 }}
                    className={`glass-card p-4 flex items-start gap-4 transition-all ${
                      unread
                        ? 'border-l-2 border-l-blue-500'
                        : 'opacity-60'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      {/* Type badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>
                          {label}
                        </span>
                        {unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      {/* Message — whitespace-pre-line preserves \n formatting */}
                      <p className={`text-sm font-medium whitespace-pre-line ${unread ? 'text-white' : 'text-gray-400'}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-500">
                          {new Date(n.createdAt).toLocaleString('en-IN')}
                        </span>
                        {n.registerNumber && (
                          <span className="text-xs font-mono text-blue-400">{n.registerNumber}</span>
                        )}
                      </div>
                    </div>

                    {/* Mark-read button */}
                    {unread && (
                      <button
                        onClick={() => handleMarkRead(n._id)}
                        title="Mark as read"
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
