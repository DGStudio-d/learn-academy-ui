import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AppStateProvider } from '../contexts/AppStateContext'
import { TooltipProvider } from '../components/ui/tooltip'
import { Toaster } from '../components/ui/toaster'

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any
  queryClient?: QueryClient
  route?: string
}

function AllTheProviders({ 
  children,
  queryClient = createTestQueryClient(),
  route = '/',
}: {
  children: React.ReactNode
  queryClient?: QueryClient
  route?: string
}) {
  // Mock router history
  window.history.pushState({}, 'Test page', route)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppStateProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </AppStateProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders queryClient={queryClient} route={route} {...props} />
    ),
    ...renderOptions,
  })
}

// Mock API responses
export const mockApiResponse = <T extends any>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
})

// Mock user data
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'student' as const,
  phone: '+1234567890',
  preferred_language: 'en' as const,
  profile_image: null,
  email_verified_at: '2023-01-01T00:00:00.000Z',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
}

// Mock auth context values
export const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  lastActivity: Date.now(),
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
  checkAuthStatus: vi.fn().mockResolvedValue(true),
  refreshSession: vi.fn().mockResolvedValue(undefined),
  hasPermission: vi.fn().mockReturnValue(true),
  hasRole: vi.fn().mockReturnValue(true),
  extendSession: vi.fn(),
}

// Mock app state context values
export const mockAppState = {
  currentUser: mockUser,
  isAuthenticated: true,
  settings: {
    theme: 'light' as const,
    notifications: {
      email: true,
      push: true,
      desktop: false,
      marketing: false,
    },
    ui: {
      sidebarCollapsed: false,
      compactMode: false,
      animationsEnabled: true,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium' as const,
    },
  },
  ui: {
    loading: false,
    sidebarOpen: true,
    theme: 'light' as const,
    language: 'en',
    isRTL: false,
  },
  cache: {
    dashboardStats: {},
    recentActivity: [],
    notifications: [],
  },
  network: {
    isOnline: true,
    isSlowConnection: false,
  },
  errors: {
    global: null,
    api: {},
  },
}

// Mock language context values
export const mockLanguageContext = {
  currentLanguage: 'en',
  isRTL: false,
  changeLanguage: vi.fn(),
  supportedLanguages: ['en', 'ar', 'es'],
}

// Wait for async operations
export const waitFor = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Create mock server responses
export const mockServer = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
}

// Export everything
export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }