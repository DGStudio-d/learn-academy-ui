import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorHandler } from './errorHandler';
import { config } from './config';
import type { ApiResponse, ApiErrorResponse } from '@/types/api';

// Extend Axios types to include custom metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: number;
      retryCount?: number;
    };
  }
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: config.api.timeout,
  withCredentials: false, // Don't send cookies
});

// Request retry configuration
const MAX_RETRIES = config.api.retryAttempts;
const RETRY_DELAY = config.api.retryDelay;

// Request queue for handling concurrent requests
const requestQueue = new Map<string, Promise<any>>();

// Token management
const TOKEN_KEY = config.auth.tokenKey;
const USER_KEY = config.auth.userKey;

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

export const clearStoredToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear stored data:', error);
  }
};

export const getStoredUser = (): any | null => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user:', error);
  }
};

// Request interceptor to add auth token and handle requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = {
      startTime: Date.now(),
      retryCount: config.metadata?.retryCount || 0,
    };

    // Add request ID for tracking
    if (config.headers) {
      config.headers['X-Request-ID'] = generateRequestId();
    }

    // Handle duplicate request prevention for GET requests
    const requestKey = `${config.method}-${config.url}-${JSON.stringify(config.params)}`;
    if (config.method === 'get' && requestQueue.has(requestKey)) {
      // Return existing promise for duplicate GET requests
      return Promise.reject({ canceled: true, message: 'Duplicate request' });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? Date.now() - startTime : 0;
    
    // Log slow requests in development
    if (config.app.isDevelopment && duration > 2000) {
      console.warn(`Slow API request (${duration}ms):`, {
        url: response.config.url,
        method: response.config.method,
        duration,
      });
    }

    // Add metadata to response
    if (response.data && typeof response.data === 'object') {
      (response.data as any)._meta = {
        timestamp: new Date().toISOString(),
        duration,
        requestId: response.config.headers?.['X-Request-ID'],
      };
    }

    return response;
  },
  async (error: AxiosError) => {
    const apiError = error as ApiErrorResponse;
    
    // Handle request cancellation
    if (error.message === 'Duplicate request') {
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        console.warn('Request timeout:', error.config?.url);
      } else {
        console.warn('Network error:', error.config?.url);
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // Don't retry auth errors
      return Promise.reject(apiError);
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY;
      
      console.warn(`Rate limited. Retrying after ${delay}ms`);
      await sleep(delay);
    }

    // Implement retry logic for certain errors
    const config = error.config as InternalAxiosRequestConfig;
    if (config && shouldRetryRequest(apiError, config)) {
      config.metadata = config.metadata || {};
      config.metadata.retryCount = (config.metadata.retryCount || 0) + 1;
      
      const delay = RETRY_DELAY * Math.pow(2, config.metadata.retryCount - 1); // Exponential backoff
      console.warn(`Retrying request (${config.metadata.retryCount}/${MAX_RETRIES}) after ${delay}ms:`, config.url);
      
      await sleep(delay);
      return api(config);
    }

    // Create detailed error information
    const errorDetails = ApiErrorHandler.createErrorDetails(apiError);
    
    // Log error for debugging
    const errorMessage = (error as any)?.message || 'Unknown error';
    const responseMessage = (error as any)?.response?.data?.message;
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: responseMessage || errorMessage,
      retries: config?.metadata?.retryCount || 0,
    });

    return Promise.reject(apiError);
  }
);

// Utility functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shouldRetryRequest(error: ApiErrorResponse, config: InternalAxiosRequestConfig): boolean {
  const retryCount = config.metadata?.retryCount || 0;
  
  // Don't retry if max retries reached
  if (retryCount >= MAX_RETRIES) {
    return false;
  }

  // Don't retry for client errors (except timeouts and rate limits)
  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return error.response.status === 408 || error.response.status === 429;
  }

  // Retry for network errors and server errors
  return !error.response || (error.response.status >= 500);
}

// Enhanced API methods with better error handling
export const apiMethods = {
  get: async <T>(url: string, config?: any): Promise<T> => {
    try {
      const response = await api.get<ApiResponse<T>>(url, config);
      return response.data.data as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error as ApiErrorResponse);
    }
  },

  post: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await api.post<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error as ApiErrorResponse);
    }
  },

  put: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await api.put<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error as ApiErrorResponse);
    }
  },

  delete: async <T>(url: string, config?: any): Promise<T> => {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config);
      return response.data.data as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error as ApiErrorResponse);
    }
  },

  patch: async <T>(url: string, data?: any, config?: any): Promise<T> => {
    try {
      const response = await api.patch<ApiResponse<T>>(url, data, config);
      return response.data.data as T;
    } catch (error) {
      throw ApiErrorHandler.handleError(error as ApiErrorResponse);
    }
  },
};

export default api;