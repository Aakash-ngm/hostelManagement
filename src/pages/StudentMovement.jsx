import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiLogIn, FiClock, FiShield, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import RegisterSearch from '../components/movement/RegisterSearch';
import StudentCard from '../components/movement/StudentCard';
import { recordOut, recordIn } from '../services/movementService';
import { useAuth } from '../context/AuthContext';

const StudentMovement = () => {
  const [mode, setMode] = useState('out'); // 'out' | 'in'
  const [student, setStudent] = useState(null);
  const [inStudent, setInStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetForm = () => {
    setStudent(null);
    setInStudent(null);
    setResult(null);
  };

  const checkScheduledOuting = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const eveningStart = 16 * 60 + 30; // 4:30 PM
    const eveningEnd = 18 * 60 + 30;   // 6:30 PM
    const dinnerStart = 20 * 60;       // 8:00 PM
    const dinnerEnd = 21 * 60;         // 9:00 PM

    if (totalMinutes >= eveningStart && totalMinutes <= eveningEnd) {
      return { type: 'EveningOuting', label: '🌆 Evening Outing (4:30 PM - 6:30 PM)' };
    }
    if (totalMinutes >= dinnerStart && totalMinutes <= dinnerEnd) {
      return { type: 'DinnerBreak', label: '🍽 Dinner Outing (8:00 PM - 9:00 PM)' };
    }
    return null;
  };

  const detectOutingType = (stud) => {
    if (!stud) return null;

    if (stud.activeEmergency) {
      return {
        type: 'EmergencyPermission',
        label: `🚨 Approved Emergency Permission (Warden: ${stud.activeEmergency.wardenName})`,
        reason: stud.activeEmergency.reason,
        valid: true
      };
    }

    const getISTDateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      const partMap = {};
      parts.forEach(p => { partMap[p.type] = p.value; });
      const dateStr = `${partMap.year}-${partMap.month}-${partMap.day}`;
      const hour = parseInt(partMap.hour, 10);
      return { dateStr, hour };
    };

    const getSlotRangeLabel = (slot) => {
      if (slot === 'Morning') return 'Morning (6:00 AM - 12:00 PM)';
      if (slot === 'Afternoon') return 'Afternoon (12:00 PM - 4:00 PM)';
      if (slot === 'Evening') return 'Evening (4:00 PM - 7:00 PM)';
      if (slot === 'Night') return 'Night (7:00 PM - 10:00 PM)';
      return '';
    };

    const getSlotName = (hr) => {
      if (hr >= 6 && hr < 12) return 'Morning';
      if (hr >= 12 && hr < 16) return 'Afternoon';
      if (hr >= 16 && hr < 19) return 'Evening';
      if (hr >= 19 && hr < 22) return 'Night';
      return 'Restricted Hours';
    };

    const { dateStr: currentISTDate, hour: currentHour } = getISTDateTime();
    const currentSlot = getSlotName(currentHour);

    let isLeaveValidNow = false;
    let isLeaveFuture = false;
    let isLeaveExpired = false;
    let leaveMessage = '';

    if (stud.activeLeave && stud.activeLeave.status === 'Approved') {
      const leave = stud.activeLeave;
      const scheduledStartDate = new Date(leave.fromDate).toISOString().split('T')[0];
      
      const fromDateObj = new Date(leave.fromDate);
      const day = String(fromDateObj.getDate()).padStart(2, '0');
      const month = String(fromDateObj.getMonth() + 1).padStart(2, '0');
      const year = fromDateObj.getFullYear();
      const fromDateStr = `${day}/${month}/${year}`;
      
      const expectedSlot = leave.outTimeSeason || 'Morning';
      const rangeLabel = getSlotRangeLabel(expectedSlot);
      const shiftLabel = `${expectedSlot} Shift`;

      if (currentISTDate === scheduledStartDate) {
        if (currentSlot === expectedSlot) {
          isLeaveValidNow = true;
        } else {
          const slotOrder = { 'Morning': 1, 'Afternoon': 2, 'Evening': 3, 'Night': 4, 'Restricted Hours': 5 };
          if (slotOrder[expectedSlot] > slotOrder[currentSlot]) {
            isLeaveFuture = true;
            leaveMessage = `You have an approved Native Leave for today (${fromDateStr}) during the ${shiftLabel} (${rangeLabel}). You can check out only at your scheduled leave time.`;
          } else {
            isLeaveExpired = true;
            leaveMessage = `Your approved Native Leave scheduled for today's ${shiftLabel} has expired. Please contact the warden.`;
          }
        }
      } else if (currentISTDate < scheduledStartDate) {
        isLeaveFuture = true;
        leaveMessage = `You have an approved Native Leave for ${fromDateStr} (${shiftLabel}). You can check out only at your scheduled leave time.`;
      } else {
        isLeaveExpired = true;
        leaveMessage = `Your approved Native Leave start date (${fromDateStr}) has expired. Please contact the warden.`;
      }

      if (isLeaveValidNow) {
        return {
          type: 'NativeLeave',
          label: `🏠 Approved Native Leave (${expectedSlot} Slot) (Warden: ${leave.wardenName})`,
          reason: leave.reason,
          valid: true
        };
      }
    }

    let isStaffPermissionValidNow = false;
    let isStaffPermissionFuture = false;
    let isStaffPermissionExpired = false;
    let staffPermissionMessage = '';

    if (stud.activeStaffPermission && stud.activeStaffPermission.status === 'Approved') {
      const perm = stud.activeStaffPermission;
      const now = new Date();
      const startTime = new Date(perm.permissionStartTime);
      const endTime = new Date(perm.permissionEndTime);

      if (now >= startTime && now <= endTime) {
        isStaffPermissionValidNow = true;
      } else if (now < startTime) {
        isStaffPermissionFuture = true;
        const startStr = startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        const startDateObj = startTime;
        const startDay = String(startDateObj.getDate()).padStart(2, '0');
        const startMonth = String(startDateObj.getMonth() + 1).padStart(2, '0');
        const startYear = startDateObj.getFullYear();
        const startDateStr = `${startDay}/${startMonth}/${startYear}`;
        
        staffPermissionMessage = `You have an approved Staff Permission for ${startDateStr} at ${startStr}. You can check out only at your scheduled permission time.`;
      } else {
        isStaffPermissionExpired = true;
        staffPermissionMessage = `Your approved Staff Permission has expired. Please contact the warden.`;
      }

      if (isStaffPermissionValidNow) {
        return {
          type: 'StaffPermission',
          label: `👤 Approved Staff Permission (Staff: ${perm.staffName})`,
          reason: perm.reason,
          valid: true
        };
      }
    }

    // 3. Fallback check for regular scheduled outing times
    const scheduled = checkScheduledOuting();
    if (scheduled) {
      return {
        type: scheduled.type,
        label: scheduled.label,
        reason: 'Regular daily outing',
        valid: true
      };
    }

    // 4. If nothing is valid now, return detailed warning message
    if (isLeaveFuture) {
      return {
        type: 'NativeLeave',
        label: `${leaveMessage}\n\nUntil then, you can go outside only during:\n\nEvening Outing: 4:30 PM – 6:30 PM\nDinner Break: 8:00 PM – 9:00 PM`,
        reason: stud.activeLeave.reason,
        valid: false
      };
    }

    if (isStaffPermissionFuture) {
      return {
        type: 'StaffPermission',
        label: `${staffPermissionMessage}\n\nUntil then, you can go outside only during:\n\nEvening Outing: 4:30 PM – 6:30 PM\nDinner Break: 8:00 PM – 9:00 PM`,
        reason: stud.activeStaffPermission.reason,
        valid: false
      };
    }

    if (isLeaveExpired) {
      return {
        type: 'NativeLeave',
        label: `${leaveMessage}\n\nUntil then, you can go outside only during:\n\nEvening Outing: 4:30 PM – 6:30 PM\nDinner Break: 8:00 PM – 9:00 PM`,
        reason: stud.activeLeave.reason,
        valid: false
      };
    }

    if (isStaffPermissionExpired) {
      return {
        type: 'StaffPermission',
        label: `${staffPermissionMessage}\n\nUntil then, you can go outside only during:\n\nEvening Outing: 4:30 PM – 6:30 PM\nDinner Break: 8:00 PM – 9:00 PM`,
        reason: stud.activeStaffPermission.reason,
        valid: false
      };
    }

    return {
      type: null,
      label: `No active approved leaves, permissions, or scheduled outing times found.\n\nYou can go outside only during:\n\nEvening Outing: 4:30 PM – 6:30 PM\nDinner Break: 8:00 PM – 9:00 PM`,
      valid: false
    };
  };

  const handleOut = async () => {
    if (!student) return toast.error('Search for a student first');
    const detection = detectOutingType(student);
    if (!detection || !detection.valid) {
      return toast.error('Checkout is locked. No valid outing type detected.');
    }

    setLoading(true);
    try {
      const res = await recordOut({ registerNumber: student.registerNumber });
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
      setResult({ type: 'in', data: res.data, alerts: res.data.alerts });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record IN');
    } finally {
      setLoading(false);
    }
  };

  const handleGateSignOut = () => {
    logout();
    navigate('/gate/login');
  };

  const detectedOuting = detectOutingType(student);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="max-w-2xl mx-auto w-full mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <FiShield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Hostel Gate Entry</h1>
            <p className="text-[10px] text-gray-500 mt-0.5">Terminal: {user?.name}</p>
          </div>
        </div>

        <div className="text-center hidden sm:block">
          <p className="text-xs text-gray-400 font-semibold font-mono">
            {currentTime.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
          </p>
        </div>

        <button
          onClick={handleGateSignOut}
          className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg transition-all"
        >
          <FiLogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Main card */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center space-y-5">
        {!result && (
          <div className="glass-card p-1.5 flex gap-1.5">
            {[
              { id: 'out', icon: FiLogOut, label: 'Record OUT', color: 'text-amber-400' },
              { id: 'in', icon: FiLogIn, label: 'Record IN', color: 'text-emerald-400' }
            ].map(({ id, icon: Icon, label }) => (
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
        )}

        {/* OUT Mode */}
        {mode === 'out' && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Step 1 — Search Register Number</h2>
              <RegisterSearch onFound={setStudent} onClear={() => setStudent(null)} />
            </div>

            <AnimatePresence>
              {student && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <StudentCard student={student} />

                  <div className="glass-card p-5 space-y-4">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Step 2 — Automated Outing Check</h2>
                    
                    {detectedOuting && detectedOuting.valid ? (
                      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                        <p className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5">
                          <FiCheckCircle className="w-4 h-4" /> Valid checkout detected
                        </p>
                        <p className="text-white text-xs font-semibold">{detectedOuting.label}</p>
                        <p className="text-gray-400 text-xs mt-0.5">Reason: <strong>{detectedOuting.reason}</strong></p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
                        <p className="text-red-400 text-sm font-semibold flex items-center gap-1.5">
                          <FiAlertCircle className="w-4 h-4" /> Checkout Locked
                        </p>
                        <p className="text-gray-300 text-xs whitespace-pre-line">{detectedOuting?.label}</p>
                      </div>
                    )}

                    {detectedOuting && detectedOuting.valid && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleOut}
                        disabled={loading}
                        className="btn-primary w-full py-3 rounded-xl font-semibold text-sm transition-all"
                      >
                        {loading ? 'Recording...' : 'Allow OUT (Record Gate Exit)'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* IN Mode */}
        {mode === 'in' && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="glass-card p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Step 1 — Search Register Number</h2>
              <RegisterSearch onFound={setInStudent} onClear={() => setInStudent(null)} />
            </div>

            <AnimatePresence>
              {inStudent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <StudentCard student={inStudent} />

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleIn}
                    disabled={loading}
                    className="btn-success w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Recording...' : <><FiLogIn className="w-4 h-4" /> Record IN (Gate Entry)</>}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Result summary card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`glass-card p-6 text-center space-y-4 border ${
                result.type === 'error'
                  ? 'border-red-500/30 bg-red-900/10'
                  : result.type === 'in' && result.data.data?.isLate
                  ? 'border-red-500/30 bg-red-900/10'
                  : result.type === 'in' && result.data.data?.returnedEarly
                  ? 'border-blue-500/30 bg-blue-900/10'
                  : 'border-emerald-500/30 bg-emerald-900/10'
              }`}
            >
              <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
                result.type === 'error'
                  ? 'bg-red-500/20'
                  : result.type === 'in' && result.data.data?.isLate
                  ? 'bg-red-500/20'
                  : result.type === 'in' && result.data.data?.returnedEarly
                  ? 'bg-blue-500/20'
                  : 'bg-emerald-500/20'
              }`}>
                {result.type === 'error'
                  ? <FiAlertCircle className="w-7 h-7 text-red-400" />
                  : result.type === 'in' && result.data.data?.isLate
                  ? <FiAlertCircle className="w-7 h-7 text-red-400" />
                  : <FiCheckCircle className="w-7 h-7 text-emerald-400" />
                }
              </div>
              <div>
                <p className="text-white font-bold text-base">{result.type === 'error' ? result.message : result.data.message}</p>
                {result.type === 'in' && result.data.data?.durationMinutes && (
                  <p className="text-gray-400 text-xs mt-1">Duration outside: <span className="text-white font-semibold font-mono">{result.data.data.durationMinutes} minutes</span></p>
                )}
                {result.type === 'in' && result.data.data?.returnedEarly && (
                  <p className="text-blue-400 text-xs mt-1 font-semibold">🟢 Returned early from Native Leave</p>
                )}
                {result.type === 'in' && result.data.data?.isLate && (
                  <p className="text-red-400 text-xs mt-1 font-semibold">⚠️ Late by {result.data.data.lateByMinutes} minutes</p>
                )}
                {result.alerts?.map((a, i) => (
                  <p key={i} className="text-amber-400 text-[10px] mt-1">ℹ️ {a}</p>
                ))}
              </div>
              <button onClick={resetForm} className="btn-secondary py-2 text-xs">Record Another Entry</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[10px] text-gray-600 mt-4">
        © {new Date().getFullYear()} HostelFlow Gate Terminal. Security Log Enforced.
      </div>
    </div>
  );
};

export default StudentMovement;
