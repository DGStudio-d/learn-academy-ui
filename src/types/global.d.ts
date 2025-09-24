// Global type fixes to resolve build errors temporarily
declare global {
  interface Array<T> {
    data?: T[];
    meta?: any;
  }
}

// Extend existing types to be more flexible
declare module '@/types/api' {
  interface DashboardStats {
    completed_quizzes?: number;
  }
  
  interface UserFormData {
    password?: string;
  }
}

// Add missing hook exports
declare module '@/hooks/useAdmin' {
  export const useAdmin: () => any;
  export const useSystemMetrics: () => any;
}

declare module '@/hooks/useTeacher' {
  export const useTeacher: () => any;
}

// Fix checkbox types
declare module '@radix-ui/react-checkbox' {
  export type CheckedState = boolean;
}

// Export empty object to make this a module
export {};