import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
  requireAllPermissions?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  redirectTo = '/login',
  fallbackComponent,
  requireAllPermissions = false,
}) => {
  const { 
    isAuthenticated, 
    user, 
    isLoading, 
    hasRole, 
    hasPermission, 
    checkAuthStatus 
  } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);

  // Verify auth status when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      setIsVerifying(true);
      checkAuthStatus().finally(() => {
        setIsVerifying(false);
      });
    }
  }, [isAuthenticated, user, checkAuthStatus]);

  // Show loading state while checking authentication or verifying
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && !hasRole(allowedRoles)) {
    // Show fallback component if provided
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/dashboard',
    };
    
    const defaultRedirect = roleRedirects[user.role as keyof typeof roleRedirects] || '/';
    return <Navigate to={defaultRedirect} replace />;
  }

  // Check permission-based access if permissions are specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAllPermissions
      ? requiredPermissions.every(permission => hasPermission(permission))
      : requiredPermissions.some(permission => hasPermission(permission));
    
    if (!hasAccess) {
      // Show fallback component if provided
      if (fallbackComponent) {
        return <>{fallbackComponent}</>;
      }
      
      // Show unauthorized access message
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this resource.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};