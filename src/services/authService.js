import api from './api';
export const studentRegister = (data) => api.post('/auth/student/register', data);
export const studentLogin = (data) => api.post('/auth/student/login', data);
export const wardenRegister = (data) => api.post('/auth/warden/register', data);
export const wardenLogin = (data) => api.post('/auth/warden/login', data);
export const getMe = () => api.get('/auth/me');
