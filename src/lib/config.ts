// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Authentication Configuration
  auth: {
    tokenKey: 'learn_academy_token',
    userKey: 'learn_academy_user',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },

  // Application Configuration
  app: {
    name: 'Learn Academy',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.MODE === 'development',
    isProduction: import.meta.env.MODE === 'production',
  },

  // Feature Flags
  features: {
    enableGuestAccess: import.meta.env.VITE_ENABLE_GUEST_ACCESS !== 'false',
    enableRealTimeUpdates: import.meta.env.VITE_ENABLE_REALTIME !== 'false',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },

  // UI Configuration
  ui: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar', 'es'],
    theme: {
      defaultMode: 'light',
      enableDarkMode: true,
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 20, 50],
    },
  },

  // Performance Configuration
  performance: {
    enableVirtualization: true,
    lazyLoadThreshold: 100,
    imageOptimization: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  },

  // Error Handling Configuration
  errors: {
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    maxRetries: 3,
    retryDelay: 1000,
    showDetailedErrors: import.meta.env.MODE === 'development',
  },

  // Validation Configuration
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    email: {
      allowedDomains: [], // Empty array means all domains allowed
    },
  },
} as const;

// Type-safe environment variable access
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  return value || defaultValue || '';
};

// Validate required environment variables
export const validateEnvironment = (): void => {
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0 && config.app.isProduction) {
    console.error('Missing required environment variables:', missingVars);
    // In production, we might want to show a user-friendly error
  }

  if (config.app.isDevelopment) {
    console.log('Environment configuration:', {
      mode: config.app.environment,
      apiBaseURL: config.api.baseURL,
      features: config.features,
    });
  }
};

// Initialize environment validation
validateEnvironment();