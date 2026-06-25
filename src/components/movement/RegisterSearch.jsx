import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLoader, FiX } from 'react-icons/fi';
import { useStudent } from '../../hooks/useStudent';

const RegisterSearch = ({ onFound, onClear }) => {
  const [input, setInput] = useState('');
  const { student, loading, error, lookup, clear } = useStudent();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const found = await lookup(input.trim());
    if (found && onFound) onFound(found);
  };

  const handleClear = () => {
    setInput('');
    clear();
    if (onClear) onClear();
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Enter Register Number (e.g. CS2021001)"
            className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm font-mono uppercase tracking-wide"
          />
        </div>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 flex-shrink-0"
        >
          {loading ? <FiLoader className="animate-spin w-4 h-4" /> : <FiSearch className="w-4 h-4" />}
          Search
        </motion.button>
        {student && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-3 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-xl text-sm transition-colors flex-shrink-0"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </form>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
        >
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default RegisterSearch;
