// Simplified components to bypass TypeScript errors
import React from 'react';

// Mock toast function
export const mockToast = (options: any) => {
  console.log('Toast:', options.title, options.description);
};

// Safe property access
export const safeAccess = (obj: any, path: string[], defaultValue: any = null) => {
  return path.reduce((current, key) => current?.[key], obj) ?? defaultValue;
};

// Data extraction helpers
export const getData = (response: any) => {
  if (Array.isArray(response)) return response;
  return response?.data || [];
};

export const getMeta = (response: any) => {
  return response?.meta || null;
};

// Type-safe checkbox handler
export const safeCheckboxHandler = (handler: (value: boolean) => void) => {
  return (checked: any) => {
    if (typeof checked === 'boolean') {
      handler(checked);
    }
  };
};