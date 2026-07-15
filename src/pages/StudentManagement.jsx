import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiLoader, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Badge from '../components/common/Badge';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAllStudents, addStudent, updateStudent, deleteStudent } from '../services/wardenService';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'Other'];

const emptyForm = { name: '', registerNumber: '', email: '', password: 'student@123', department: 'CSE', year: '1st Year', roomNumber: '', studentPhone: '', parentPhone: '' };

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchStudents = async (pg = 1, q = search) => {
    setLoading(true);
    try {
      const res = await getAllStudents({ page: pg, limit: 15, search: q });
      setStudents(res.data.data.students || []);
      setTotalPages(res.data.data.totalPages || 1);
      setTotal(res.data.data.total || 0);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(1, ''); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents(1, search);
  };

  const openAdd = () => { setEditStudent(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s) => {
    setEditStudent(s);
    setForm({ ...s, password: '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editStudent) {
        const payload = { ...form };
        if (!payload.password || payload.password.trim() === '') {
          delete payload.password;
        }
        await updateStudent(editStudent._id, payload);
        toast.success('Student updated!');
      } else {
        await addStudent(form);
        toast.success('Student added!');
      }
      setShowModal(false);
      fetchStudents(page, search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(deleteId);
      toast.success('Student removed');
      fetchStudents(page, search);
    } catch { toast.error('Delete failed'); }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total} students registered</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <FiPlus className="w-4 h-4" /> Add Student
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, register no, department, room..."
              className="w-full pl-9 pr-4 py-3 input-field"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button type="submit" className="btn-primary flex-1 sm:flex-none px-5">Search</button>
            {search && <button type="button" onClick={() => { setSearch(''); fetchStudents(1, ''); }} className="btn-secondary px-4"><FiX className="w-4 h-4" /></button>}
          </div>
        </form>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner text="Loading students..." /></div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-gray-800/80">
                    {['Register No.', 'Name', 'Department', 'Year', 'Room', 'Status', 'Phone', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {students.map((s, i) => (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-blue-400 text-xs font-medium">{s.registerNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{s.name}</p>
                            <p className="text-gray-500 text-xs">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{s.department}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{s.year}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.roomNumber}</td>
                      <td className="px-4 py-3"><Badge status={s.currentStatus} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.studentPhone}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(s._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && (
                <div className="py-16 text-center text-gray-500">No students found</div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800/50">
              <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchStudents(page - 1, search); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-gray-700 hover:text-white disabled:opacity-40 transition-colors">Prev</button>
                <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchStudents(page + 1, search); }} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-gray-700 hover:text-white disabled:opacity-40 transition-colors">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">{editStudent ? 'Edit Student' : 'Add New Student'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FiX className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2"><label className="form-label">Full Name</label><input required value={form.name} onChange={set('name')} placeholder="Arjun Kumar" className="input-field" /></div>
                <div><label className="form-label">Register Number</label><input required value={form.registerNumber} onChange={e => setForm(p => ({ ...p, registerNumber: e.target.value.toUpperCase() }))} placeholder="CS2021001" className="input-field font-mono uppercase" /></div>
                <div><label className="form-label">Room Number</label><input required value={form.roomNumber} onChange={set('roomNumber')} placeholder="A-101" className="input-field" /></div>
                <div className="col-span-1 sm:col-span-2"><label className="form-label">Email</label><input type="email" required value={form.email} onChange={set('email')} placeholder="student@college.edu.in" className="input-field" /></div>
                <div><label className="form-label">Department</label><select required value={form.department} onChange={set('department')} className="input-field">{DEPTS.map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label className="form-label">Year</label><select required value={form.year} onChange={set('year')} className="input-field">{YEARS.map(y => <option key={y}>{y}</option>)}</select></div>
                <div><label className="form-label">Student Phone</label><input type="tel" required value={form.studentPhone} onChange={set('studentPhone')} maxLength={10} placeholder="9876543210" className="input-field" /></div>
                <div><label className="form-label">Parent Phone</label><input type="tel" required value={form.parentPhone} onChange={set('parentPhone')} maxLength={10} placeholder="9876543210" className="input-field" /></div>
                {!editStudent && (
                  <div className="col-span-1 sm:col-span-2">
                    <label className="form-label">Password</label>
                    <input 
                      type="text" 
                      value={form.password || ''} 
                      onChange={set('password')} 
                      placeholder="student@123" 
                      className="input-field" 
                    />
                  </div>
                )}
                <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary w-full sm:flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary w-full sm:flex-1 flex items-center justify-center gap-2">
                    {saving ? <FiLoader className="animate-spin w-4 h-4" /> : null}
                    {saving ? 'Saving...' : editStudent ? 'Update Student' : 'Add Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to remove this student? This action cannot be undone."
        confirmText="Delete"
        isDanger
      />
    </DashboardLayout>
  );
};

export default StudentManagement;
