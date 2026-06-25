import { useState } from 'react';
import { lookupStudent } from '../services/movementService';

export const useStudent = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookup = async (registerNumber) => {
    if (!registerNumber?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await lookupStudent(registerNumber.trim().toUpperCase());
      setStudent(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Student not found');
      setStudent(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setStudent(null); setError(null); };

  return { student, loading, error, lookup, clear };
};
