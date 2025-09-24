// Temporary fixes for build errors - these should be replaced with proper implementations

export const mockToast = {
  success: () => {},
  error: () => {},
  dismiss: () => {},
};

// Mock backup download
export const downloadBackup = async (backupResult: any) => {
  console.log('Download backup:', backupResult);
  // Create a mock blob URL for download
  const blob = new Blob([JSON.stringify(backupResult)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Mock data transformer
export const transformApiResponse = <T>(response: any): T[] => {
  if (Array.isArray(response)) return response;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
};

// Create default dashboard stats
export const createDefaultDashboardStats = () => ({
  total_users: 0,
  total_teachers: 0,
  total_students: 0,
  total_programs: 0,
  total_quizzes: 0,
  total_meetings: 0,
  completed_quizzes: 0,
  upcoming_meetings: 0,
  enrollment_requests: 0,
  system_health: 'healthy' as const,
});