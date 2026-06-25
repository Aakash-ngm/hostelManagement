import api from './api';
export const getDailyReport = (date) => api.get('/report/daily', { params: { date } });
export const getWeeklyReport = () => api.get('/report/weekly');
export const getMonthlyReport = (year, month) => api.get('/report/monthly', { params: { year, month } });
export const getChartData = () => api.get('/report/chart');
export const exportReport = (type, params = {}) => {
  const token = localStorage.getItem('hf_token');
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const queryParams = new URLSearchParams({ type, ...params }).toString();
  window.open(`${baseUrl}/report/export?${queryParams}`, '_blank');
};
