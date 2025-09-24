import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboard } from '../../../pages/dashboard/AdminDashboard';
import { AuthProvider } from '../../../contexts/AuthContext';
import { LanguageProvider } from '../../../contexts/LanguageContext';

// Mock the hooks
vi.mock('../../../hooks/useAdmin', () => ({
  useAdminDashboardStats: () => ({
    data: {
      total_users: 150,
      total_programs: 25,
      active_teachers: 12,
      active_sessions: 45,
      daily_logins: 89
    },
    isLoading: false
  }),
  useAdminUsers: () => ({
    data: {
      data: {
        data: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 1,
          from: 1,
          to: 1
        }
      }
    },
    isLoading: false
  }),
  useAdminLanguages: () => ({
    data: [
      { id: 1, name: 'English', code: 'en', is_active: true },
      { id: 2, name: 'Arabic', code: 'ar', is_active: true }
    ],
    isLoading: false
  }),
  useAdminSettings: () => ({
    data: {
      guest_can_access_languages: true,
      guest_can_access_teachers: false,
      guest_can_access_quizzes: true
    },
    isLoading: false
  }),
  useSystemHealth: () => ({
    data: {
      server_status: 'online',
      database_status: 'healthy',
      api_status: 'good',
      response_time: 150
    }
  }),
  useUpdateAdminSettings: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

// Mock the auth context
vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    },
    isAuthenticated: true
  })
}));

// Mock the language context
vi.mock('../../../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLanguage: () => ({
    currentLanguage: 'en',
    setLanguage: vi.fn()
  })
}));

// Mock the dashboard layout
vi.mock('../../../components/layout/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  )
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin dashboard with statistics', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminDashboard />
      </Wrapper>
    );

    // Check if the dashboard title is rendered
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    
    // Check if statistics are displayed
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // total_users
      expect(screen.getByText('25')).toBeInTheDocument(); // total_programs
      expect(screen.getByText('12')).toBeInTheDocument(); // active_teachers
    });
  });

  it('renders system health information', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('online')).toBeInTheDocument();
      expect(screen.getByText('healthy')).toBeInTheDocument();
    });
  });

  it('renders navigation tabs', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminDashboard />
      </Wrapper>
    );

    // Check if all tabs are present
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /enrollments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /system health/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /reports/i })).toBeInTheDocument();
  });

  it('displays recent users section', async () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <AdminDashboard />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Users')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });
});