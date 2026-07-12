import api from './api';
export const applyLeave = (data) => api.post('/leave/apply', data);
export const returnFromLeave = (data) => api.post('/leave/return', data);
export const getActiveLeaves = () => api.get('/leave/active');
export const getAllLeaves = (params) => api.get('/leave/all', { params });
export const getPendingLeaves = () => api.get('/leave/pending');
export const approveLeave = (id) => api.post(`/leave/approve/${id}`);
export const rejectLeave = (id) => api.post(`/leave/reject/${id}`);
export const recordLeaveOut = (data) => api.post('/leave/out', data);
export const getMyLeaves = () => api.get('/leave/student/my-leaves');
export const editLeave = (id, data) => api.put(`/leave/edit/${id}`, data);
export const cancelLeave = (id) => api.post(`/leave/cancel/${id}`);

