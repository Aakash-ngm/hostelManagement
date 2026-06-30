import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield, FiClock, FiUsers, FiFileText,
  FiArrowRight, FiCheck, FiSun, FiMoon
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: FiClock, title: 'Real-Time Tracking', desc: 'Track every student\'s movement — IN, OUT, permissions — with live timestamps.' },
  { icon: FiShield, title: 'Late Arrival Detection', desc: 'Automatically flags late returns based on hostel curfew windows.' },
  { icon: FiUsers, title: 'Student Management', desc: 'Complete CRUD with register number search and auto-filled profiles.' },
  { icon: FiFileText, title: 'Excel Reports', desc: 'Export daily, weekly, and monthly attendance reports in formatted Excel sheets.' },
];

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex flex-wrap sm:flex-nowrap items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <FiShield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">HostelFlow</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
            {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
          <Link to="/student/login" className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 font-semibold px-3 py-1.5 rounded-lg">
            Student Login
          </Link>
          <Link to="/warden/login" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-semibold px-3 py-1.5 rounded-lg">
            Warden Login
          </Link>
          <Link to="/gate/login" className="text-xs sm:text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-xl transition-colors">
            Gate Login
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Smart Hostel Management System
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Hostel Attendance
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Replace manual register entries with a fully digital hostel attendance and student movement tracking system. Built for Indian engineering college hostels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student/login">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-950/20 text-base transition-all"
              >
                Student Portal <FiArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/warden/login">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 text-base transition-all"
              >
                Warden Portal <FiArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/gate/login">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 text-white font-semibold rounded-2xl text-base transition-all"
              >
                <FiShield className="w-5 h-5" /> Gate Terminal
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8 mt-20"
        >
          {[['100%', 'Digital Records'], ['Real-Time', 'Live Tracking'], ['Auto', 'Late Detection'], ['Excel', 'Export Ready']].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{v}</p>
              <p className="text-gray-500 text-sm mt-1">{l}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
          <p className="text-gray-400 max-w-lg mx-auto">A complete solution to eliminate paperwork and modernize your hostel operations.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border border-blue-500/20 rounded-3xl p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to go digital?</h2>
          <p className="text-gray-400 mb-8">Register as a warden to get started, or use the movement portal to track student entries.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/warden/register" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
              Register as Warden
            </Link>
            <Link to="/student/register" className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 font-semibold rounded-xl transition-colors">
              Student Registration
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-6 text-center text-gray-500 text-sm">
        © 2024 HostelFlow — Smart Hostel Management System
      </footer>
    </div>
  );
};

export default LandingPage;
