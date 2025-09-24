// Mock API responses for development/fallback
export const createMockPaginatedResponse = <T>(data: T[], page = 1, perPage = 10) => ({
  data,
  current_page: page,
  per_page: perPage,
  total: data.length,
  last_page: Math.ceil(data.length / perPage),
  from: (page - 1) * perPage + 1,
  to: Math.min(page * perPage, data.length),
  first_page_url: '/api/data?page=1',
  last_page_url: `/api/data?page=${Math.ceil(data.length / perPage)}`,
  next_page_url: page < Math.ceil(data.length / perPage) ? `/api/data?page=${page + 1}` : null,
  prev_page_url: page > 1 ? `/api/data?page=${page - 1}` : null,
  meta: {
    timestamp: new Date().toISOString(),
    request_id: `req_${Date.now()}`,
    version: '1.0.0',
  }
});

export const createMockResponse = <T>(data: T) => ({
  success: true,
  message: 'Success',
  data,
  meta: {
    timestamp: new Date().toISOString(),
    request_id: `req_${Date.now()}`,
    version: '1.0.0',
  }
});