const statusColors = {
  Inside: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Outside: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Permission: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NativeLeave: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Late: 'bg-red-500/20 text-red-400 border-red-500/30',
  LateReturn: 'bg-red-500/20 text-red-400 border-red-500/30',
  Returned: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Out: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Revoked: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  EveningOuting: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DinnerBreak: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  RegularOuting: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const Badge = ({ status, label, className = '' }) => {
  const colorClass = statusColors[status] || statusColors.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 flex-shrink-0" />
      {label || status}
    </span>
  );
};

export default Badge;
