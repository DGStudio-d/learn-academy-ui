// API response utilities for handling different response formats

// Type guard to check if response is paginated
export function isPaginatedResponse<T>(data: any): data is {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
} {
  return data && typeof data === 'object' && 'data' in data && Array.isArray(data.data);
}

// Helper to extract data from API responses
export function getResponseData<T>(response: T[] | { data: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  if (isPaginatedResponse(response)) {
    return response.data;
  }
  return [];
}

// Helper to extract pagination info
export function getPaginationInfo(response: any) {
  if (!isPaginatedResponse(response)) {
    return null;
  }
  
  return {
    current_page: response.current_page,
    per_page: response.per_page,
    total: response.total,
    last_page: response.last_page,
    from: response.from,
    to: response.to,
    first_page_url: response.first_page_url,
    last_page_url: response.last_page_url,
    next_page_url: response.next_page_url,
    prev_page_url: response.prev_page_url,
  };
}

// Wrapper for handling checkbox checked state
export function handleCheckboxChange(
  setter: (value: boolean) => void
): (checked: boolean | 'indeterminate') => void {
  return (checked) => {
    if (typeof checked === 'boolean') {
      setter(checked);
    }
  };
}