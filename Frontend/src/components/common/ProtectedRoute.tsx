import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import Spinner from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}><Spinner size="lg" /></div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
