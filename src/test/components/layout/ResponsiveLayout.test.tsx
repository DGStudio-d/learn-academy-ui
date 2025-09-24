import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav'
import { MobileNav } from '@/components/layout/MobileNav'
import { TouchNavigation } from '@/components/layout/TouchNavigation'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock the mobile hook
vi.mock('@/hooks/use-mobile')
const mockUseIsMobile = vi.mocked(useIsMobile)

// Mock the auth context
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

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  lastActivity: Date.now(),
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
  checkAuthStatus: vi.fn(),
  refreshSession: vi.fn(),
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
  extendSession: vi.fn(),
}

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
}))

// Mock language context
vi.mock('@/contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
  useLanguage: () => ({
    currentLanguage: 'en',
    isRTL: false,
    changeLanguage: vi.fn(),
  }),
}))

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
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

describe('Responsive Layout Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Header Component', () => {
    it('renders desktop navigation on large screens', () => {
      mockUseIsMobile.mockReturnValue(false)
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      expect(screen.getByText('Learn Academy')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('shows mobile menu button on mobile screens', () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
    })

    it('displays user menu when authenticated', () => {
      mockUseIsMobile.mockReturnValue(false)
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      expect(screen.getByText('JD')).toBeInTheDocument() // User initials
    })

    it('shows login/register buttons when not authenticated', () => {
      mockAuthContext.isAuthenticated = false
      mockAuthContext.user = null
      mockUseIsMobile.mockReturnValue(false)
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      expect(screen.getByText('nav.login')).toBeInTheDocument()
      expect(screen.getByText('nav.register')).toBeInTheDocument()
    })
  })

  describe('Sidebar Component', () => {
    it('renders role-based navigation items', () => {
      render(
        <TestWrapper>
          <div style={{ display: 'flex' }}>
            <Sidebar userRole="student" />
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('nav.dashboard')).toBeInTheDocument()
      expect(screen.getByText('nav.programs')).toBeInTheDocument()
      expect(screen.getByText('nav.quizzes')).toBeInTheDocument()
    })

    it('shows different menu items for different roles', () => {
      const { rerender } = render(
        <TestWrapper>
          <div style={{ display: 'flex' }}>
            <Sidebar userRole="admin" />
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('nav.users')).toBeInTheDocument()
      expect(screen.getByText('nav.settings')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <div style={{ display: 'flex' }}>
            <Sidebar userRole="teacher" />
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('nav.content')).toBeInTheDocument()
      expect(screen.getByText('nav.students')).toBeInTheDocument()
    })

    it('displays user information in footer', () => {
      render(
        <TestWrapper>
          <div style={{ display: 'flex' }}>
            <Sidebar userRole="student" />
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  describe('BreadcrumbNav Component', () => {
    it('generates breadcrumbs from current path', () => {
      // Mock location
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/users' },
        writable: true,
      })

      render(
        <TestWrapper>
          <BreadcrumbNav />
        </TestWrapper>
      )

      expect(screen.getByText('nav.home')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
    })

    it('shows home icon when requested', () => {
      render(
        <TestWrapper>
          <BreadcrumbNav showHome={true} />
        </TestWrapper>
      )

      // Should show home icon in breadcrumb
      const homeLinks = screen.getAllByRole('link')
      expect(homeLinks.length).toBeGreaterThan(0)
    })

    it('limits breadcrumb items when maxItems is set', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/users/123/edit/profile' },
        writable: true,
      })

      render(
        <TestWrapper>
          <BreadcrumbNav maxItems={3} />
        </TestWrapper>
      )

      // Should show ellipsis when items exceed maxItems
      expect(screen.getByText('...')).toBeInTheDocument()
    })
  })

  describe('MobileNav Component', () => {
    it('only renders on mobile devices', () => {
      mockUseIsMobile.mockReturnValue(false)
      
      const { container } = render(
        <TestWrapper>
          <MobileNav />
        </TestWrapper>
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders mobile navigation when on mobile', () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <MobileNav />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument()
    })

    it('shows search functionality', async () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <MobileNav />
        </TestWrapper>
      )

      // Open mobile menu
      fireEvent.click(screen.getByLabelText('Open navigation menu'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('nav.search')).toBeInTheDocument()
      })
    })

    it('displays user information when authenticated', async () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <MobileNav />
        </TestWrapper>
      )

      // Open mobile menu
      fireEvent.click(screen.getByLabelText('Open navigation menu'))

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
      })
    })
  })

  describe('TouchNavigation Component', () => {
    it('only renders on mobile devices by default', () => {
      mockUseIsMobile.mockReturnValue(false)
      
      const { container } = render(
        <TestWrapper>
          <TouchNavigation />
        </TestWrapper>
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders on desktop when showOnDesktop is true', () => {
      mockUseIsMobile.mockReturnValue(false)
      
      render(
        <TestWrapper>
          <TouchNavigation showOnDesktop={true} />
        </TestWrapper>
      )

      expect(screen.getByText('nav.dashboard')).toBeInTheDocument()
    })

    it('shows navigation dots for available routes', () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <TouchNavigation />
        </TestWrapper>
      )

      // Should show navigation dots
      const dots = screen.getAllByRole('button')
      expect(dots.length).toBeGreaterThan(0)
    })

    it('displays current route information', () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <TouchNavigation />
        </TestWrapper>
      )

      expect(screen.getByText('nav.dashboard')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('adapts layout based on screen size', () => {
      // Test desktop layout
      mockUseIsMobile.mockReturnValue(false)
      
      const { rerender } = render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      expect(screen.queryByLabelText('Toggle navigation menu')).not.toBeInTheDocument()

      // Test mobile layout
      mockUseIsMobile.mockReturnValue(true)
      
      rerender(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
    })

    it('handles touch gestures on mobile', () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <TouchNavigation />
        </TestWrapper>
      )

      const touchArea = screen.getByText('nav.dashboard').closest('div')
      
      // Simulate touch events
      fireEvent.touchStart(touchArea!, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchMove(touchArea!, {
        touches: [{ clientX: 200, clientY: 100 }]
      })
      
      fireEvent.touchEnd(touchArea!)

      // Should handle touch gestures without errors
      expect(touchArea).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      mockUseIsMobile.mockReturnValue(true)
      
      render(
        <TestWrapper>
          <Header />
          <MobileNav />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      mockUseIsMobile.mockReturnValue(false)
      
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      )

      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      
      // Navigation should be keyboard accessible
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('provides screen reader friendly content', () => {
      render(
        <TestWrapper>
          <BreadcrumbNav />
        </TestWrapper>
      )

      const breadcrumb = screen.getByRole('navigation')
      expect(breadcrumb).toHaveAttribute('aria-label', 'breadcrumb')
    })
  })
})