import { motion } from 'framer-motion';

const colorMap = {
  blue: {
    bg: 'from-blue-600/20 to-blue-900/10 border-blue-500/20',
    icon: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-400',
    glow: 'shadow-blue-900/20',
  },
  emerald: {
    bg: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/20',
    icon: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-900/20',
  },
  amber: {
    bg: 'from-amber-600/20 to-amber-900/10 border-amber-500/20',
    icon: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-900/20',
  },
  red: {
    bg: 'from-red-600/20 to-red-900/10 border-red-500/20',
    icon: 'bg-red-500/10 border-red-500/20',
    text: 'text-red-400',
    glow: 'shadow-red-900/20',
  },
  purple: {
    bg: 'from-purple-600/20 to-purple-900/10 border-purple-500/20',
    icon: 'bg-purple-500/10 border-purple-500/20',
    text: 'text-purple-400',
    glow: 'shadow-purple-900/20',
  },
  pink: {
    bg: 'from-pink-600/20 to-pink-900/10 border-pink-500/20',
    icon: 'bg-pink-500/10 border-pink-500/20',
    text: 'text-pink-400',
    glow: 'shadow-pink-900/20',
  },
  cyan: {
    bg: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/20',
    icon: 'bg-cyan-500/10 border-cyan-500/20',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-900/20',
  },
  orange: {
    bg: 'from-orange-600/20 to-orange-900/10 border-orange-500/20',
    icon: 'bg-orange-500/10 border-orange-500/20',
    text: 'text-orange-400',
    glow: 'shadow-orange-900/20',
  },
};

const StatCard = ({ icon: Icon, label, value, color = 'blue', trend, onClick, index = 0 }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c.bg} p-5 cursor-pointer shadow-lg ${c.glow} transition-shadow hover:shadow-xl`}
    >
      {/* Glow orb */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.text} opacity-10 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">{label}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-bold text-white tabular-nums"
          >
            {value ?? '—'}
          </motion.p>
          {trend && <p className="text-xs mt-2 text-gray-500">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${c.icon}`}>
          {Icon && <Icon className={`w-5 h-5 ${c.text}`} />}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
