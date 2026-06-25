import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiLogIn, FiClock, FiCalendar, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import RegisterSearch from '../components/movement/RegisterSearch';
import StudentCard from '../components/movement/StudentCard';
import { recordOut, recordIn } from '../services/movementService';
import { grantPermission, grantStaffPermission } from '../services/permissionService';
import { applyLeave } from '../services/leaveService';

const MOVEMENT_TYPES = [
  { value: 'EveningOuting', label: '🌆 Evening Outing', desc: '4:30 PM – 6:30 PM', color: 'border-orange-500/30 bg-orange-500/10' },
  { value: 'DinnerBreak', label: '🍽 Dinner Outing', desc: '8:00 PM – 9:00 PM', color: 'border-pink-500/30 bg-pink-500/10' },
  { value: 'StaffPermission', label: '👤 Staff Permission', desc: 'Approved by staff member', color: 'border-blue-500/30 bg-blue-500/10' },
  { value: 'NativeLeave', label: '🏠 Native Leave', desc: 'Multi-day home leave', color: 'border-purple-500/30 bg-purple-500/10' },
];

const StudentMovement = () => {
  const [mode, setMode] = useState('out'); // 'out' | 'in'
  const [student, setStudent] = useState(null);
  const [inStudent, setInStudent] = useState(null);
  const [movementType, setMovementType] = useState('');
  const [reason, setReason] = useState('');
  const [permissionUntil, setPermissionUntil] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // New States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [staffName, setStaffName] = useState('');
  const [permissionDate, setPermissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setStudent(null);
    setMovementType('');
    setReason('');
    setPermissionUntil('');
    setFromDate('');
    setToDate('');
    setStaffName('');
    setPermissionDate(new Date().toISOString().split('T')[0]);
    setFromTime('');
    setToTime('');
    setResult(null);
  };

  const checkOutingValid = (type) => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (type === 'EveningOuting') {
      const start = 16 * 60 + 30; // 4:30 PM
      const end = 18 * 60 + 30;   // 6:30 PM
      return totalMinutes >= start && totalMinutes <= end;
    }
    if (type === 'DinnerBreak') {
      const start = 20 * 60; // 8:00 PM
      const end = 21 * 60;   // 9:00 PM
      return totalMinutes >= start && totalMinutes <= end;
    }
    return true;
  };

  const handleOut = async () => {
    if (!student) return toast.error('Search for a student first');
    if (!movementType) return toast.error('Select movement type');

    if (movementType === 'EveningOuting' && !checkOutingValid('EveningOuting')) {
      return toast.error('Evening Outing is only allowed between 04:30 PM and 06:30 PM.');
    }
    if (movementType === 'DinnerBreak' && !checkOutingValid('DinnerBreak')) {
      return toast.error('Dinner Outing is only allowed between 08:00 PM and 09:00 PM.');
    }

    if (movementType === 'Permission' && !permissionUntil) return toast.error('Select permission until time');
    if (movementType === 'NativeLeave' && (!fromDate || !toDate)) return toast.error('Select leave dates');
    if (movementType === 'StaffPermission') {
      if (!staffName) return toast.error('Enter authorized staff name');
      if (!reason) return toast.error('Enter reason');
      if (!permissionDate) return toast.error('Select permission date');
      if (!fromTime) return toast.error('Select from time');
      if (!toTime) return toast.error('Select to time');
    }

    setLoading(true);
    try {
      let res;
      if (movementType === 'Permission') {
        // Build datetime string from today + time
        const today = new Date().toISOString().split('T')[0];
        const fullDateTime = `${today}T${permissionUntil}:00`;
        res = await grantPermission({
          registerNumber: student.registerNumber,
          permissionUntil: fullDateTime,
          reason: reason || 'Personal work',
        });
      } else if (movementType === 'NativeLeave') {
        res = await applyLeave({
          registerNumber: student.registerNumber,
          fromDate,
          toDate,
          reason: reason || 'Native leave',
        });
      } else if (movementType === 'StaffPermission') {
        res = await grantStaffPermission({
          registerNumber: student.registerNumber,
          permissionDate,
          fromTime,
          toTime,
          staffName,
          reason,
        });
      } else {
        res = await recordOut({
          registerNumber: student.registerNumber,
          movementType,
          reason,
        });
      }
      setResult({ type: 'success', data: res.data, alerts: res.data.alerts });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record OUT');
    } finally {
      setLoading(false);
    }
  };

  const handleIn = async () => {
    if (!inStudent) return toast.error('Search for a student first');
    setLoading(true);
    try {
      const res = await recordIn({ registerNumber: inStudent.registerNumber });
      setResult({ type: 'in', data: res.data });
      toast.success(res.data.message);
      if (res.data.data.isLate) {
        toast.error(`⚠️ Late by ${res.data.data.lateByMinutes} minutes!`, { duration: 5000 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record IN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <FiArrowLeft className="w-4 h-4" /> Home
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Attendance Portal</h1>
          <p className="text-xs text-gray-400 font-medium">{currentTime.toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' })}</p>
        </div>
        <Link to="/warden/login" className="text-xs text-blue-400 hover:text-blue-300">Warden →</Link>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Mode toggle */}
        <div className="glass-card p-1.5 flex gap-1.5">
          {[{ id: 'out', icon: FiLogOut, label: 'Going OUT', color: 'text-amber-400' },
            { id: 'in', icon: FiLogIn, label: 'Coming IN', color: 'text-emerald-400' }].map(({ id, icon: Icon, label, color }) => (
            <button
              key={id}
              onClick={() => { setMode(id); resetForm(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                mode === id
                  ? id === 'out'
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* OUT form */}
        {mode === 'out' && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Step 1 — Find Student</h2>
              <RegisterSearch onFound={setStudent} onClear={() => setStudent(null)} />
            </div>
            <AnimatePresence>{student && <StudentCard student={student} />}</AnimatePresence>

            {student && student.currentStatus === 'Inside' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-semibold text-gray-300">Step 2 — Select Movement Type</h2>
                <div className="grid grid-cols-1 gap-2">
                  {MOVEMENT_TYPES.map(({ value, label, desc, color }) => {
                    const isValid = checkOutingValid(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          if (isValid) {
                            setMovementType(value);
                          } else {
                            toast.error(`${label} is only allowed during its scheduled hours: ${desc}`);
                          }
                        }}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                          !isValid
                            ? 'opacity-45 cursor-not-allowed border-gray-800/80 bg-gray-900/40 text-gray-500'
                            : movementType === value
                            ? color
                            : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600/50'
                        }`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${!isValid ? 'text-gray-500' : 'text-white'}`}>
                            {label} {!isValid && <span className="text-xs text-red-500 font-normal ml-1">(Closed)</span>}
                          </p>
                          <p className="text-gray-400 text-xs">{desc}</p>
                        </div>
                        {isValid && movementType === value && <FiCheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Extra fields based on type */}
                {movementType && movementType !== 'EveningOuting' && movementType !== 'DinnerBreak' && movementType !== 'StaffPermission' && (
                  <div>
                    <label className="form-label">Reason</label>
                    <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter reason..." className="input-field" />
                  </div>
                )}
                {movementType === 'Permission' && (
                  <div>
                    <label className="form-label">Permission Until (Time)</label>
                    <input type="time" value={permissionUntil} onChange={e => setPermissionUntil(e.target.value)} className="input-field" />
                  </div>
                )}
                {movementType === 'NativeLeave' && (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Reason</label>
                      <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Enter reason..." className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="form-label">From Date</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="input-field" /></div>
                      <div><label className="form-label">To Date</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="input-field" /></div>
                    </div>
                  </div>
                )}
                {movementType === 'StaffPermission' && (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Staff Name</label>
                      <input
                        type="text"
                        value={staffName}
                        onChange={e => setStaffName(e.target.value)}
                        placeholder="Enter authorized staff name..."
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="form-label">Reason</label>
                      <input
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Enter reason..."
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="form-label">Permission Date</label>
                      <input
                        type="date"
                        value={permissionDate}
                        onChange={e => setPermissionDate(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">From Time</label>
                        <input
                          type="time"
                          value={fromTime}
                          onChange={e => setFromTime(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="form-label">To Time</label>
                        <input
                          type="time"
                          value={toTime}
                          onChange={e => setToTime(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOut}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? 'Recording...' : <><FiLogOut className="w-4 h-4" /> Record OUT Entry</>}
                </motion.button>
              </motion.div>
            )}
            {student && student.currentStatus !== 'Inside' && (
              <div className="glass-card p-4 text-center">
                <p className="text-amber-400 text-sm">⚠️ Student is currently <strong>{student.currentStatus}</strong>. Cannot record OUT.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* IN form */}
        {mode === 'in' && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Search Student</h2>
              <RegisterSearch onFound={setInStudent} onClear={() => setInStudent(null)} />
            </div>
            <AnimatePresence>{inStudent && <StudentCard student={inStudent} />}</AnimatePresence>
            {inStudent && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleIn}
                disabled={loading}
                className="btn-success w-full flex items-center justify-center gap-2"
              >
                {loading ? 'Recording...' : <><FiLogIn className="w-4 h-4" /> Record IN Entry</>}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Result card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`glass-card p-6 text-center space-y-4 border ${
                result.type === 'in' && result.data.data.isLate
                  ? 'border-red-500/30 bg-red-900/10'
                  : 'border-emerald-500/30 bg-emerald-900/10'
              }`}
            >
              <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                result.type === 'in' && result.data.data.isLate ? 'bg-red-500/20' : 'bg-emerald-500/20'
              }`}>
                {result.type === 'in' && result.data.data.isLate
                  ? <FiAlertCircle className="w-7 h-7 text-red-400" />
                  : <FiCheckCircle className="w-7 h-7 text-emerald-400" />
                }
              </div>
              <div>
                <p className="text-white font-bold text-lg">{result.data.message}</p>
                {result.type === 'in' && result.data.data.durationMinutes && (
                  <p className="text-gray-400 text-sm mt-1">Duration outside: <span className="text-white font-semibold">{result.data.data.durationMinutes} minutes</span></p>
                )}
                {result.type === 'in' && result.data.data.isLate && (
                  <p className="text-red-400 text-sm mt-1 font-semibold">⚠️ Late by {result.data.data.lateByMinutes} minutes</p>
                )}
                {result.alerts?.map((a, i) => (
                  <p key={i} className="text-amber-400 text-xs mt-1">ℹ️ {a}</p>
                ))}
              </div>
              <button onClick={resetForm} className="btn-secondary">Record Another Entry</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentMovement;
