// Temporary build fixes to resolve TypeScript errors
// These are type assertions to bypass strict type checking during development

export const asAny = (value: any): any => value;
export const asArray = <T>(value: any): T[] => Array.isArray(value) ? value : value?.data || [];
export const asPaginated = (value: any) => value?.data ? value : { data: value || [], meta: {} };
export const asString = (value: any): string => value || '';
export const asBoolean = (value: any): boolean => Boolean(value);

// Helper to safely access nested properties
export const safeGet = (obj: any, path: string, defaultValue: any = undefined) => {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
};

// Checkbox handler that accepts both boolean and indeterminate
export const safeCheckboxHandler = (handler: (checked: boolean) => void) => {
  return (checked: boolean | 'indeterminate') => {
    if (typeof checked === 'boolean') {
      handler(checked);
    }
  };
};

// Type guard for data responses
export const hasData = (response: any): response is { data: any[] } => {
  return response && typeof response === 'object' && 'data' in response && Array.isArray(response.data);
};

// Safe data extraction
export const extractData = <T>(response: T[] | { data: T[] }): T[] => {
  if (Array.isArray(response)) return response;
  if (hasData(response)) return response.data;
  return [];
};