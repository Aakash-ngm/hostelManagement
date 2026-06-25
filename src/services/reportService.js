import api from './api';
export const getDailyReport = (date) => api.get('/report/daily', { params: { date } });
export const getWeeklyReport = () => api.get('/report/weekly');
export const getMonthlyReport = (year, month) => api.get('/report/monthly', { params: { year, month } });
export const getChartData = () => api.get('/report/chart');
export const exportReport = async (type, params = {}) => {
  const response = await api.get('/report/export', {
    params: { type, ...params },
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
