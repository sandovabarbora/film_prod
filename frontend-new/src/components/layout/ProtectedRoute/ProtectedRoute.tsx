import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../../../services/authService';

interface ProtectedRouteProps {
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectTo = '/login' }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;