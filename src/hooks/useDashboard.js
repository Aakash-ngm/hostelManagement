import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats, getLiveStatus, getCurrentlyOutside } from '../services/wardenService';
import { getChartData } from '../services/reportService';

export const useDashboard = (pollInterval = 30000) => {
  const [stats, setStats] = useState(null);
  const [liveStatus, setLiveStatus] = useState([]);
  const [outside, setOutside] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, liveRes, outsideRes, chartRes] = await Promise.all([
        getDashboardStats(),
        getLiveStatus(),
        getCurrentlyOutside(),
        getChartData(),
      ]);
      setStats(statsRes.data.data);
      setLiveStatus(liveRes.data.data.students || []);
      setOutside(outsideRes.data.data.records || []);
      setChartData(chartRes.data.data.chartData || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, pollInterval);
    return () => clearInterval(interval);
  }, [fetchAll, pollInterval]);

  return { stats, liveStatus, outside, chartData, loading, error, refetch: fetchAll };
};
