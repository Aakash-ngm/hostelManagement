import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield, FiClock, FiUsers, FiFileText, FiArrowRight, FiCheck, FiSun, FiMoon,
  FiGrid, FiCalendar, FiBookOpen, FiDownload, FiAlertTriangle, FiUser, FiActivity
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const whyFeatures = [
  { icon: FiBookOpen, title: 'Digital Attendance', desc: 'Modernized roll calls and live attendance logging without manual registers.' },
  { icon: FiShield, title: 'Gate Entry System', desc: 'Secure terminal for recording student checkouts and checkins in real-time.' },
  { icon: FiUser, title: 'Student Portal', desc: 'Dedicated hub for students to check statistics, request permissions, and log leaves.' },
  { icon: FiGrid, title: 'Warden Dashboard', desc: 'Full-featured overview of active students, meal counts, leaves, and approvals.' },
  { icon: FiClock, title: 'Permission Management', desc: 'Efficient approval workflows for staff and emergency checkouts.' },
  { icon: FiCalendar, title: 'Native Leave', desc: 'Seamless submission, tracking, and validation of native leave requests.' },
  { icon: FiActivity, title: 'Meal Planning', desc: 'Dynamic calculators to estimate food requirements based on live occupancy.' },
  { icon: FiFileText, title: 'Real-Time Reports', desc: 'Anonymized dining summaries and detailed movement logs instantly generated.' },
  { icon: FiAlertTriangle, title: 'Late Return Detection', desc: 'Automated triggers to alert administrators when curfew limits are crossed.' },
  { icon: FiDownload, title: 'Excel Export', desc: 'Download fully formatted Excel sheets for easy external reporting and mess audits.' },
];

const AnimatedCounter = ({ value, label }) => {
  const [displayValue, setDisplayValue] = useState(value === 'Smart' || value === 'Instant' ? '' : '0');

  useEffect(() => {
    if (value === 'Smart' || value === 'Instant') {
      setDisplayValue(value);
      return;
    }
    const target = parseInt(value, 10);
    let start = 0;
    const duration = 1200;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start) + (value.includes('%') ? '%' : ''));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="text-center p-6 glass-card border border-gray-800 bg-gray-900/30 rounded-2xl flex-1 min-w-[200px] shadow-lg hover:border-blue-500/20 transition-all duration-300"
    >
      <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
        {displayValue}
      </p>
      <p className="text-gray-400 text-xs mt-2 font-semibold tracking-wide uppercase">{label}</p>
    </motion.div>
  );
};

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-gray-800/40">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <img src="/hostelflow_logo.png" alt="HostelFlow Logo" className="w-9 h-9 rounded-xl object-contain shadow-md" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">HostelFlow</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
            {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
          <Link to="/student/register" className="hidden sm:block text-sm text-gray-400 hover:text-white font-medium px-4 py-2">
            Register Student
          </Link>
          <Link to="/student/login" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/20">
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 text-left space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
            <span>🏠 Smart Hostel Management System</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight text-white">
            Hostel Management
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl">
            Digitize hostel operations with secure gate entry, smart attendance, permission management, native leave tracking, meal planning, and real-time monitoring—all in one platform.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/student/login">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/20 text-sm transition-all"
              >
                <FiUser className="w-4 h-4" /> Student Portal
              </motion.button>
            </Link>
            <Link to="/warden/login">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/30 text-sm transition-all"
              >
                <FiGrid className="w-4 h-4" /> Warden Portal
              </motion.button>
            </Link>
            <Link to="/gate/login">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/80 text-white font-bold rounded-2xl text-sm transition-all"
              >
                <FiShield className="w-4 h-4" /> Gate Entry
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Floating App Mockup (SaaS Visual Graphic) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 hidden lg:flex justify-center"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-[360px] aspect-[4/5] rounded-[36px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-emerald-600/10 border border-gray-800/60 p-5 relative shadow-2xl backdrop-blur-xl"
          >
            {/* Inner Dashboard Mockup design */}
            <div className="h-full rounded-2xl bg-gray-950/80 border border-gray-800/50 p-4 space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-gray-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">hostelflow.io</span>
              </div>
              <div className="space-y-3 flex-1 pt-2">
                <div className="h-10 rounded-xl bg-gray-900/60 border border-gray-800/60 flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center"><FiShield className="w-3 h-3 text-blue-400" /></div>
                    <span className="text-xs text-gray-300 font-semibold">Active Status</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Secure</span>
                </div>
                <div className="h-20 rounded-xl bg-gray-900/40 border border-gray-800/40 p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Today's Dining Count</span>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-bold text-white leading-none">Breakfast</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">7:00 - 8:30 AM</p>
                    </div>
                    <span className="text-xl font-extrabold text-emerald-400">92%</span>
                  </div>
                </div>
                <div className="h-20 rounded-xl bg-gray-900/40 border border-gray-800/40 p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Live Curfew Alert</span>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-bold text-white leading-none">Late Returners</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Threshold: 30m</p>
                    </div>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg">0 Overdue</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-center text-gray-600 font-mono">
                Hostel Operations Reimagined
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Statistics Strip */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-wrap justify-center gap-6">
          <AnimatedCounter value="100%" label="Paperless Records" />
          <AnimatedCounter value="24/7" label="Real-Time Monitoring" />
          <AnimatedCounter value="Smart" label="Permission Management" />
          <AnimatedCounter value="Instant" label="Excel Reports" />
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-gray-800/40">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why HostelFlow?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Eliminate manuals and registers with an all-in-one digital workspace optimized for students, wardens, and gate security.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyFeatures.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-gray-900/30 border border-gray-800/60 rounded-3xl p-6 hover:border-blue-500/20 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-950/20 to-indigo-950/20 border border-blue-500/10 rounded-[32px] p-12 shadow-2xl"
        >
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Ready to go digital?</h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base max-w-md mx-auto">
            Modernize your student account registration or access the warden and gate terminal log-ins instantly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/student/register" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 text-sm">
              Student Registration
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/40 py-8 text-center text-gray-500 text-xs tracking-wider uppercase font-medium">
        © {new Date().getFullYear()} HostelFlow — Smart Hostel Management System
      </footer>
    </div>
  );
};

export default LandingPage;
