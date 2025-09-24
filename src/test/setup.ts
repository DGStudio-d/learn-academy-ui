import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'
import { cleanup } from '@testing-library/react'
import { afterEach, vi, expect } from 'vitest'

// Extend Jest matchers with accessibility testing
expect.extend(toHaveNoViolations)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: vi.fn().mockReturnValue(new Uint8Array(16)),
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock fetch for API calls
global.fetch = vi.fn().mockImplementation(() => 
  Promise.reject(new Error('API not available in tests'))
)

// Mock i18n API loading
vi.mock('@/lib/i18n', async () => {
  const actual = await vi.importActual('@/lib/i18n')
  return {
    ...actual,
    loadApiTranslations: vi.fn().mockResolvedValue(null)
  }
})

// Mock missing DOM methods for JSDOM compatibility
Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false)
Element.prototype.scrollIntoView = vi.fn()
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()