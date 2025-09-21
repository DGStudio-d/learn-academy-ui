import api from '../lib/api';
import type { ApiErrorResponse } from '../types/api';
import { ApiErrorHandler } from '../lib/errorHandler';

export const healthService = {
  // Check if API is available
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      // Don't show toast for health checks
      ApiErrorHandler.handleError(error as ApiErrorResponse, {
        showToast: false,
        customMessage: 'Health check failed'
      });
      return false;
    }
  },

  // Get API status information
  getStatus: async (): Promise<{
    available: boolean;
    baseURL: string;
    timestamp: string;
  }> => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const timestamp = new Date().toISOString();
    
    try {
      const available = await healthService.checkHealth();
      return { available, baseURL, timestamp };
    } catch (error) {
      return { available: false, baseURL, timestamp };
    }
  },
};