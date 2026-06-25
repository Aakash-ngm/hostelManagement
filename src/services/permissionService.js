import api from './api';
export const grantPermission = (data) => api.post('/permission/grant', data);
export const getActivePermissions = () => api.get('/permission/active');
export const getAllPermissions = (params) => api.get('/permission/all', { params });
