import api from './api';
export const getNotifications = (params) => api.get('/notification', { params });
export const markRead = (id) => api.put(`/notification/${id}/read`);
export const markAllRead = () => api.put('/notification/mark-all-read');
export const clearAll = () => api.delete('/notification/clear');
