// Export all API services
export { authService } from './authService';
export { studentService } from './studentService';
export { teacherService } from './teacherService';
export { adminService } from './adminService';
export { guestService } from './guestService';

// Export API client
export { default as api } from '../lib/api';
export { getStoredToken, setStoredToken, clearStoredToken, getStoredUser, setStoredUser } from '../lib/api';

// Export types
export type * from '../types/api';