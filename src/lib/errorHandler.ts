import { toast } from '@/hooks/use-toast';
import type { ApiErrorResponse } from '@/types/api';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories for different handling strategies
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// User-friendly error messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  CONNECTION_LOST: 'Connection lost. Retrying...',
  
  // Authentication errors
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Authorization errors
  FORBIDDEN: 'You do not have permission to perform this action.',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions for this operation.',
  
  // Validation errors
  VALIDATION_FAILED: 'Please check your input and try again.',
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  INVALID_FORMAT: 'Please check the format of your input.',
  
  // Server errors
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
  MAINTENANCE_MODE: 'System is under maintenance. Please try again later.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
  
  // Success messages
  SUCCESS_SAVE: 'Saved successfully.',
  SUCCESS_DELETE: 'Deleted successfully.',
  SUCCESS_UPDATE: 'Updated successfully.',
  SUCCESS_CREATE: 'Created successfully.',
} as const;

export interface ErrorDetails {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  statusCode?: number;
  retry?: boolean;
  timestamp: string;
  requestId?: string;
  debugInfo?: any;
}

export class ApiErrorHandler {
  static categorizeError(error: ApiErrorResponse): ErrorCategory {
    if (!error.response) {
      return ErrorCategory.NETWORK;
    }

    const status = error.response.status;
    
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status >= 400 && status < 500) return ErrorCategory.CLIENT;
    if (status >= 500) return ErrorCategory.SERVER;
    if (status === 422) return ErrorCategory.VALIDATION;
    
    return ErrorCategory.UNKNOWN;
  }

  static getSeverity(error: ApiErrorResponse): ErrorSeverity {
    const category = this.categorizeError(error);
    const status = error.response?.status;

    switch (category) {
      case ErrorCategory.NETWORK:
        return ErrorSeverity.MEDIUM;
      case ErrorCategory.AUTHENTICATION:
        return ErrorSeverity.HIGH;
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.MEDIUM;
      case ErrorCategory.VALIDATION:
        return ErrorSeverity.LOW;
      case ErrorCategory.SERVER:
        return status === 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  static getUserMessage(error: ApiErrorResponse): string {
    const category = this.categorizeError(error);
    const status = error.response?.status;
    const apiMessage = error.response?.data?.message;

    // Use API message if it's user-friendly
    if (apiMessage && this.isUserFriendlyMessage(apiMessage)) {
      return apiMessage;
    }

    // Fallback to predefined messages
    switch (category) {
      case ErrorCategory.NETWORK:
        if (error.code === 'ECONNABORTED') return ERROR_MESSAGES.TIMEOUT_ERROR;
        return ERROR_MESSAGES.NETWORK_ERROR;
        
      case ErrorCategory.AUTHENTICATION:
        if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
        
      case ErrorCategory.AUTHORIZATION:
        return ERROR_MESSAGES.FORBIDDEN;
        
      case ErrorCategory.VALIDATION:
        return ERROR_MESSAGES.VALIDATION_FAILED;
        
      case ErrorCategory.SERVER:
        if (status === 503) return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
        return ERROR_MESSAGES.SERVER_ERROR;
        
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  static isUserFriendlyMessage(message: string): boolean {
    // Check if message contains technical terms that users shouldn't see
    const technicalTerms = [
      'exception', 'stack trace', 'query', 'database', 'sql',
      'undefined method', 'class not found', 'syntax error',
      'fatal error', 'segmentation fault', 'null pointer'
    ];
    
    const lowerMessage = message.toLowerCase();
    return !technicalTerms.some(term => lowerMessage.includes(term));
  }

  static shouldRetry(error: ApiErrorResponse): boolean {
    const category = this.categorizeError(error);
    const status = error.response?.status;

    // Don't retry client errors (4xx except 408, 429)
    if (status && status >= 400 && status < 500) {
      return status === 408 || status === 429; // Timeout or rate limit
    }

    // Retry network errors and server errors
    return category === ErrorCategory.NETWORK || category === ErrorCategory.SERVER;
  }

  static createErrorDetails(error: ApiErrorResponse): ErrorDetails {
    const category = this.categorizeError(error);
    const severity = this.getSeverity(error);
    const userMessage = this.getUserMessage(error);
    
    return {
      category,
      severity,
      message: error.message,
      userMessage,
      code: error.response?.data?.error_code || error.code,
      statusCode: error.response?.status,
      retry: this.shouldRetry(error),
      timestamp: new Date().toISOString(),
      requestId: error.response?.data?.request_id,
      debugInfo: process.env.NODE_ENV === 'development' ? {
        config: error.config,
        response: error.response?.data,
        stack: error.stack,
      } : undefined,
    };
  }

  static handleError(error: ApiErrorResponse, options?: {
    showToast?: boolean;
    customMessage?: string;
    onRetry?: () => void;
  }): ErrorDetails {
    const errorDetails = this.createErrorDetails(error);
    
    // Log error for debugging
    console.error('API Error:', errorDetails);

    // Show toast notification if requested
    if (options?.showToast !== false) {
      const message = options?.customMessage || errorDetails.userMessage;
      
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
        duration: errorDetails.severity === ErrorSeverity.CRITICAL ? 0 : 5000,
      });
    }

    // Dispatch error event for global error handling
    window.dispatchEvent(new CustomEvent('api:error', {
      detail: errorDetails
    }));

    return errorDetails;
  }

  static handleSuccess(message: string, data?: any): void {
    toast({
      title: 'Success',
      description: message,
      variant: 'default',
      duration: 3000,
    });

    // Dispatch success event
    window.dispatchEvent(new CustomEvent('api:success', {
      detail: { message, data }
    }));
  }
}