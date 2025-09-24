import React, { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { routePreloader } from '@/utils/codesplitting';

export function useRoutePreloader() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Preload routes based on authentication state and user role
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      // Preload role-specific routes
      routePreloader.preloadForRole(user.role as 'student' | 'teacher' | 'admin');
    }
  }, [isAuthenticated, user?.role]);

  // Smart preloading based on current route
  useEffect(() => {
    routePreloader.smartPreload(location.pathname, user?.role);
  }, [location.pathname, user?.role]);

  // Preload critical routes on app start
  useEffect(() => {
    routePreloader.preloadCritical();
  }, []);

  // Manual preload function for hover/focus events
  const preloadRoute = useCallback((routeName: string) => {
    return routePreloader.preloadOnHover(routeName);
  }, []);

  return {
    preloadRoute,
  };
}

// Hook for link hover preloading
export function useLinkPreloader() {
  const { preloadRoute } = useRoutePreloader();

  const createPreloadHandlers = useCallback((routeName: string) => {
    let preloadTimeout: NodeJS.Timeout;

    return {
      onMouseEnter: () => {
        // Delay preloading slightly to avoid unnecessary loads
        preloadTimeout = setTimeout(() => {
          preloadRoute(routeName);
        }, 100);
      },
      onMouseLeave: () => {
        clearTimeout(preloadTimeout);
      },
      onFocus: () => {
        preloadRoute(routeName);
      },
    };
  }, [preloadRoute]);

  return {
    createPreloadHandlers,
  };
}

// Component wrapper for automatic route preloading
export function withRoutePreloading<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  routeName: string
): React.ComponentType<T> {
  return function PreloadedComponent(props: T) {
    const { createPreloadHandlers } = useLinkPreloader();
    const handlers = createPreloadHandlers(routeName);

    return React.createElement(
      'div',
      handlers,
      React.createElement(WrappedComponent, props)
    );
  };
}