import React from 'react';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

interface RealTimeProviderProps {
  children: React.ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  // Initialize real-time updates
  useRealTimeUpdates({
    enabled: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  });

  return <>{children}</>;
};