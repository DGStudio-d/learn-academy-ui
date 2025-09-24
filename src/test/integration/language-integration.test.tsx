import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

// Simple mock for testing basic rendering
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    isRTL: false,
    changeLanguage: vi.fn(),
    supportedLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr', is_active: true },
      { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl', is_active: true },
    ],
    isLoadingLanguages: false,
    isLoadingTranslations: false,
    refreshTranslations: vi.fn(),
  }),
}));

vi.mock('../../hooks/useTranslations', () => ({
  useApiTranslations: () => ({ data: {}, isLoading: false }),
  useAvailableLanguages: () => ({ 
    data: [
      { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr', is_active: true },
      { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl', is_active: true },
    ], 
    isLoading: false 
  }),
  useUpdateLanguagePreference: () => ({ mutate: vi.fn() }),
}));

describe('Language Integration', () => {
  it('renders language switcher without crashing', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageSwitcher />
      </QueryClientProvider>
    );

    // Should render without throwing
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageSwitcher variant="compact" />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders icon-only variant', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LanguageSwitcher variant="icon-only" />
      </QueryClientProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-8', 'w-8');
  });
});