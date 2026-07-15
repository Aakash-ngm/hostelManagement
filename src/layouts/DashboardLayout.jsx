import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUsers, FiClipboard, FiLogOut, FiMenu, FiX,
  FiSun, FiMoon, FiBell, FiChevronRight, FiShield,
  FiFileText, FiHome, FiClock, FiCalendar
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getNotifications } from '../services/notificationService';

const navItems = [
  { to: '/warden/dashboard', icon: FiGrid, label: 'Dashboard', roles: ['warden'] },
  { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard', roles: ['admin-mess'] },
  { to: '/warden/students', icon: FiUsers, label: 'Students', roles: ['warden'] },
  { to: '/warden/live-status', icon: FiHome, label: 'Live Status', roles: ['warden'] },
  { to: '/warden/reports', icon: FiFileText, label: 'Reports', roles: ['warden'] },
  { to: '/admin/reports', icon: FiFileText, label: 'Reports', roles: ['admin-mess'] },
  { to: '/warden/permissions', icon: FiClock, label: 'Permissions', roles: ['warden'] },
  { to: '/warden/leaves', icon: FiCalendar, label: 'Native Leaves', roles: ['warden'] },
  { to: '/warden/notifications', icon: FiBell, label: 'Notifications', roles: ['warden'] },
];

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin-mess' || user?.email === 'warden@gmail.com') return;
    const fetchUnread = async () => {
      try {
        const res = await getNotifications({ limit: 1 });
        setUnreadCount(res.data.data.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <FiShield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">HostelFlow</p>
          <p className="text-blue-400 text-xs">{user?.role === 'admin-mess' ? 'Admin Mess Portal' : 'Warden Portal'}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems
          .filter(({ roles }) => !roles || roles.includes(user?.role))
          .filter(({ to }) => {
            if (user?.email === 'warden@gmail.com') {
              return to === '/warden/dashboard';
            }
            return true;
          })
          .map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600/20 border border-blue-500/20'
                : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all'
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center min-w-[20px] h-[20px]">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-800/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800/40 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.charAt(0) || 'W'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
        >
          <FiLogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-gray-900 border-r border-gray-800/50 flex flex-col lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-gray-800/50 bg-gray-900/60 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-gray-400">Welcome back, <span className="text-white font-semibold">{user?.name}</span></p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {user?.role !== 'admin-mess' && (
              <button
                onClick={() => navigate('/warden/notifications')}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all relative flex items-center justify-center"
                title="Notifications"
              >
                <FiBell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
