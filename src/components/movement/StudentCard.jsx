import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiBookOpen, FiHome, FiHash } from 'react-icons/fi';
import Badge from '../common/Badge';

const StudentCard = ({ student }) => {
  if (!student) return null;
  const initials = student.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/30 flex-shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{student.name}</h3>
            <p className="text-blue-400 text-xs font-mono font-medium">{student.registerNumber}</p>
          </div>
        </div>
        <Badge status={student.currentStatus} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoRow icon={FiBookOpen} text={`${student.department} • ${student.year}`} />
        <InfoRow icon={FiHome} text={`Room ${student.roomNumber}`} />
        <InfoRow icon={FiPhone} text={student.studentPhone} label="Student" />
        <InfoRow icon={FiPhone} text={student.parentPhone} label="Parent" iconColor="text-purple-400" />
      </div>
    </motion.div>
  );
};

const InfoRow = ({ icon: Icon, text, label, iconColor = 'text-blue-400' }) => (
  <div className="flex items-center gap-2 text-gray-300">
    <Icon className={`w-3.5 h-3.5 ${iconColor} flex-shrink-0`} />
    <span className="truncate text-xs">{label ? `${label}: ` : ''}{text}</span>
  </div>
);

export default StudentCard;
