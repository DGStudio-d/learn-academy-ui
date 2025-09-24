// Quick type fixes for build errors

// Safe data extraction helper
export const extractData = <T>(response: T[] | { data: T[] }): T[] => {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as any).data || [];
  }
  return [];
};

// Safe meta extraction helper
export const extractMeta = (response: any) => {
  if (response && typeof response === 'object' && 'meta' in response) {
    return response.meta;
  }
  return null;
};

// Checkbox handler wrapper
export const createCheckboxHandler = (setter: (value: boolean) => void) => {
  return (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      setter(checked);
    }
  };
};

// Safe toast functions
export const safeToast = {
  success: (message: string) => {
    try {
      toast({
        title: 'Success',
        description: message,
      });
    } catch (error) {
      console.log('Success:', message);
    }
  },
  error: (message: string) => {
    try {
      toast({
        title: 'Error', 
        description: message,
        variant: 'destructive',
      });
    } catch (error) {
      console.log('Error:', message);
    }
  },
  dismiss: () => {
    try {
      // Dismiss function if available
    } catch (error) {
      // Ignore
    }
  }
};

// Safe URL helper
export const createObjectURL = (data: any): string => {
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  } catch (error) {
    return '#';
  }
};