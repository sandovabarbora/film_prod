// src/components/layout/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoading } from '../common/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  fallbackPath = '/login' 
}: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (isLoading) {
    return <PageLoading message="Ověřování přístupu..." />;
  }

  // Not authenticated - redirect to login with return path
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ 
          from: location,
          message: 'Pro přístup k této stránce se musíte přihlásit.' 
        }} 
        replace 
      />
    );
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    const hasPermission = requiredPermissions.every(permission => 
      checkUserPermission(user, permission)
    );

    if (!hasPermission) {
      return (
        <Navigate 
          to="/dashboard" 
          state={{ 
            message: 'Nemáte oprávnění k přístupu na tuto stránku.' 
          }} 
          replace 
        />
      );
    }
  }

  return <>{children}</>;
}

// Permission checking helper
function checkUserPermission(user: any, permission: string): boolean {
  // Implement your permission logic here
  // For now, we'll just check if user exists
  // In real app, you'd check user.permissions, roles, etc.
  
  switch (permission) {
    case 'admin':
      return user.is_staff || user.is_superuser;
    case 'production_manager':
      return user.role === 'production_manager' || user.is_staff;
    case 'crew_head':
      return ['crew_head', 'production_manager'].includes(user.role) || user.is_staff;
    default:
      return true; // Default allow if permission not recognized
  }
}

// Role-based route wrapper
interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  return (
    <ProtectedRoute requiredPermissions={allowedRoles}>
      {children}
    </ProtectedRoute>
  );
}

// Admin-only route wrapper
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredPermissions={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
