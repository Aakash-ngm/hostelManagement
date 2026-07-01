import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedWardenRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>;
  if (!user || (user.role !== 'warden' && user.role !== 'admin-mess')) return <Navigate to="/warden/login" replace />;
  return children;
};

const ProtectedStudentRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading..." /></div>;
  if (!user || user.role !== 'student') return <Navigate to="/student/login" replace />;
  return children;
};

export { ProtectedWardenRoute, ProtectedStudentRoute };
