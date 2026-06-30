import api from './api';
export const lookupStudent = (registerNumber) => api.get(`/movement/lookup/${registerNumber}`);
export const recordOut = (data) => api.post('/movement/out', data);
export const recordIn = (data) => api.post('/movement/in', data);
export const getMyHistory = (days = 30) => api.get(`/movement/history?days=${days}`);
export const getStudentHistory = (registerNumber, days = 30) => api.get(`/movement/history/${registerNumber}?days=${days}`);
export const getStudentDashboardStats = () => api.get('/movement/student/stats');
