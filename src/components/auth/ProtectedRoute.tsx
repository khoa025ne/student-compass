import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requirePasswordChange?: boolean;
  allowedRoles?: string[];
}

export function ProtectedRoute({ 
  children, 
  requirePasswordChange = false,
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, mustChangePassword, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user must change password and is not on the change-password page, redirect
  if (mustChangePassword && !requirePasswordChange && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.roleName)) {
    // Redirect based on user role
    if (user.roleName === 'Admin') {
      return <Navigate to="/admin/accounts" replace />;
    } else if (user.roleName === 'Manager') {
      return <Navigate to="/manager" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
