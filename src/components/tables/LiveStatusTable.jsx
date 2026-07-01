import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import Badge from '../common/Badge';

const LiveStatusTable = ({ students = [] }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = students.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || s.currentStatus === filter;
    return matchSearch && matchFilter;
  });

  const filters = ['All', 'Inside', 'Outside', 'Permission', 'NativeLeave'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, register no, dept..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{filtered.length} students</span>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-auto rounded-xl border border-gray-800/50">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-800/80">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Register No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Year</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Room</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filtered.map((s, i) => (
              <motion.tr
                key={s._id || s.registerNumber}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-blue-400 font-medium text-xs">{s.registerNumber}</td>
                <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{s.department}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{s.year}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{s.roomNumber}</td>
                <td className="px-4 py-3"><Badge status={s.currentStatus} /></td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.studentPhone}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm">
            No students found
          </div>
        )}
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden space-y-3">
        {filtered.map((s, i) => (
          <motion.div
            key={s._id || s.registerNumber}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/50 space-y-2.5"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-semibold text-sm">{s.name}</p>
                <p className="text-blue-400 text-xs font-mono mt-0.5">{s.registerNumber}</p>
              </div>
              <Badge status={s.currentStatus} />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 pt-2 border-t border-gray-800/60">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Dept & Year</span>
                <span className="text-gray-300">{s.department} — {s.year}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Room No.</span>
                <span className="text-gray-300">Room {s.roomNumber || '—'}</span>
              </div>
            </div>

            {s.studentPhone && (
              <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Contact</span>
                <a href={`tel:${s.studentPhone}`} className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300">
                  📞 {s.studentPhone}
                </a>
              </div>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm">
            No students found
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStatusTable;
