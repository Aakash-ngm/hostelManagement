import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import StudentDashboardLayout from '../layouts/StudentDashboardLayout';
import { grantEmergencyPermission } from '../services/permissionService';
import { useAuth } from '../context/AuthContext';

const StudentEmergency = () => {
  const { user } = useAuth();
  const [wardenName, setWardenName] = useState('');
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wardenName) return toast.error('Please select a Warden');
    if (!reason) return toast.error('Please enter the emergency reason');
    if (!decision) return toast.error('Please select the Warden decision');

    setLoading(true);
    setResult(null);
    try {
      const res = await grantEmergencyPermission({
        registerNumber: user.registerNumber,
        wardenName,
        wardenDecision: decision,
        reason
      });

      if (decision === 'Rejected') {
        setResult({
          status: 'error',
          message: 'Emergency Permission was not approved.'
        });
        toast.error('Emergency Permission was not approved.');
      } else {
        setResult({
          status: 'success',
          message: res.data.message || 'Emergency OUT checkout recorded successfully!'
        });
        toast.success('Emergency checkout recorded successfully!');
        // Reset form
        setWardenName('');
        setDecision('');
        setReason('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request emergency permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiAlertTriangle className="text-red-500 animate-pulse" /> Emergency Permission
          </h1>
          <p className="text-xs text-gray-400">Declare emergency permission if you must leave the hostel immediately for an emergency situation</p>
        </div>

        {result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-6 text-center space-y-4 border ${
              result.status === 'error' ? 'border-red-500/30 bg-red-900/10' : 'border-emerald-500/30 bg-emerald-900/10'
            }`}
          >
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
              result.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {result.status === 'error' ? '❌' : '✅'}
            </div>
            <div>
              <p className="text-white font-bold text-base">{result.message}</p>
              {result.status === 'success' && (
                <p className="text-gray-400 text-xs mt-1">Your status is now updated to OUT. You may leave the hostel.</p>
              )}
            </div>
            <button onClick={() => setResult(null)} className="btn-secondary py-2 text-xs">Declare Another Emergency</button>
          </motion.div>
        ) : (
          <div className="glass-card p-5 space-y-4">
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2">
              <p className="text-red-400 text-xs font-semibold flex items-center gap-1.5">🚨 Emergency Instructions</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                This option is only for emergency situations. Please contact the Hostel Warden and explain your emergency before leaving the hostel.
              </p>
              <p className="text-amber-400 text-[11px] font-medium leading-relaxed mt-1">
                Message: "Please contact the Hostel Warden before leaving the hostel."
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label text-xs">Select Hostel Warden</label>
                <select
                  required
                  value={wardenName}
                  onChange={e => setWardenName(e.target.value)}
                  className="input-field bg-gray-900 border border-gray-700/50 text-white rounded-xl w-full p-2.5 text-sm"
                >
                  <option value="">-- Choose Warden --</option>
                  <option value="sathish">Sathish</option>
                  <option value="vijayan">Vijayan</option>
                  <option value="kannan">Kannan</option>
                  <option value="arul">Arul</option>
                </select>
              </div>

              {wardenName && (
                <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1 text-xs">
                  <p className="text-gray-400">Hostel Warden Name: <strong className="text-white capitalize">{wardenName}</strong></p>
                  <p className="text-gray-400">Hostel Warden Contact Number: <strong className="text-blue-400">
                    {wardenName === 'sathish' && '+91 98765 43210'}
                    {wardenName === 'vijayan' && '+91 98765 43211'}
                    {wardenName === 'kannan' && '+91 98765 43212'}
                    {wardenName === 'arul' && '+91 98765 43213'}
                  </strong></p>
                </div>
              )}

              <div>
                <label className="form-label text-xs">Emergency Reason</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Enter the reason for emergency checkout..."
                  className="input-field text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label text-xs">Warden Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('Approved')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      decision === 'Approved'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    🟢 Warden Approved My Emergency Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('Rejected')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      decision === 'Rejected'
                        ? 'bg-red-500/20 border-red-500 text-red-400 font-bold'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    🔴 Warden Rejected My Emergency Request
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-amber-500/80 leading-relaxed bg-amber-500/5 p-3 border border-amber-500/20 rounded-xl">
                ⚠️ <strong>Warning:</strong> Selecting an incorrect Warden decision is considered a disciplinary violation. All emergency permission records are stored and can be verified by the Hostel Warden.
              </p>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-2.5 text-white font-bold rounded-xl text-xs transition-all shadow-md ${
                  decision === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? 'Processing...' : 'Submit Emergency checkout'}
              </motion.button>
            </form>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentEmergency;
