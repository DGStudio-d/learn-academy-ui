// Type guards and utilities for handling API responses

export function hasDataProperty<T>(obj: any): obj is { data: T } {
  return obj && typeof obj === 'object' && 'data' in obj;
}

export function isArray<T>(obj: any): obj is T[] {
  return Array.isArray(obj);
}

export function ensureArray<T>(data: T[] | { data: T[] } | undefined): T[] {
  if (!data) return [];
  if (isArray(data)) return data;
  if (hasDataProperty(data)) return data.data;
  return [];
}

// Fix for checkbox onChange handlers
export const createCheckboxHandler = (setter: (value: boolean) => void) => {
  return (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      setter(checked);
    }
  };
};

// Mock data for development
export const mockPaginatedData = <T>(data: T[]) => ({
  data,
  meta: { total: data.length }
});

// Simple success message helper
export const success = (message: string) => ({
  title: 'Success',
  description: message,
});

// Simple error message helper  
export const error = (message: string) => ({
  title: 'Error',
  description: message,
  variant: 'destructive' as const,
});