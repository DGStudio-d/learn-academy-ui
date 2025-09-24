import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock the mobile hook
vi.mock('@/hooks/use-mobile')
const mockUseIsMobile = vi.mocked(useIsMobile)

// Mock auth context
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student' as const,
  preferred_language: 'en' as const,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01'
}

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}))

// Mock language context
vi.mock('@/contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
  useLanguage: () => ({
    currentLanguage: 'en',
    isRTL: false,
  }),
}))

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

describe('Responsive Layout Integration', () => {
  it('renders AppLayout with all components', () => {
    mockUseIsMobile.mockReturnValue(false)
    
    render(
      <TestWrapper>
        <AppLayout showBreadcrumbs showRoleBasedNav>
          <div>Test Content</div>
        </AppLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Learn Academy')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders DashboardLayout with sidebar and header', () => {
    mockUseIsMobile.mockReturnValue(false)
    
    render(
      <TestWrapper>
        <DashboardLayout userRole="student">
          <div>Dashboard Content</div>
        </DashboardLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Learn Academy')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    expect(screen.getByText('nav.dashboard')).toBeInTheDocument()
  })

  it('adapts to mobile layout', () => {
    mockUseIsMobile.mockReturnValue(true)
    
    render(
      <TestWrapper>
        <AppLayout>
          <div>Mobile Content</div>
        </AppLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Mobile Content')).toBeInTheDocument()
    // Should show mobile-specific elements
    expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
  })

  it('shows breadcrumbs when enabled', () => {
    mockUseIsMobile.mockReturnValue(false)
    
    render(
      <TestWrapper>
        <AppLayout showBreadcrumbs>
          <div>Content with Breadcrumbs</div>
        </AppLayout>
      </TestWrapper>
    )

    expect(screen.getByText('Content with Breadcrumbs')).toBeInTheDocument()
    // Breadcrumb navigation should be present
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('handles different user roles in dashboard layout', () => {
    mockUseIsMobile.mockReturnValue(false)
    
    const { rerender } = render(
      <TestWrapper>
        <DashboardLayout userRole="admin">
          <div>Admin Dashboard</div>
        </DashboardLayout>
      </TestWrapper>
    )

    expect(screen.getByText('nav.users')).toBeInTheDocument()
    expect(screen.getByText('nav.settings')).toBeInTheDocument()

    rerender(
      <TestWrapper>
        <DashboardLayout userRole="teacher">
          <div>Teacher Dashboard</div>
        </DashboardLayout>
      </TestWrapper>
    )

    expect(screen.getByText('nav.content')).toBeInTheDocument()
    expect(screen.getByText('nav.students')).toBeInTheDocument()
  })
})