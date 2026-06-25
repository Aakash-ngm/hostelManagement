import api from './api';
export const applyLeave = (data) => api.post('/leave/apply', data);
export const returnFromLeave = (data) => api.post('/leave/return', data);
export const getActiveLeaves = () => api.get('/leave/active');
export const getAllLeaves = (params) => api.get('/leave/all', { params });
