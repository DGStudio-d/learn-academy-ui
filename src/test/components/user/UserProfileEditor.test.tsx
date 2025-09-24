import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfileEditor } from '../../../components/user/UserProfileEditor';
import type { User } from '../../../types/api';

const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student',
  phone: '+1234567890',
  preferred_language: 'en',
  profile_image: null,
  email_verified_at: '2024-01-01T00:00:00Z',
  is_active: true,
  last_login_at: '2024-01-15T10:30:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z'
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('UserProfileEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user profile editor with user data', () => {
    render(
      <TestWrapper>
        <UserProfileEditor
          user={mockUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    render(
      <TestWrapper>
        <UserProfileEditor
          user={mockUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('calls onSave with updated data when form is submitted', async () => {
    render(
      <TestWrapper>
        <UserProfileEditor
          user={mockUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          preferred_language: 'en'
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TestWrapper>
        <UserProfileEditor
          user={mockUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows role and status controls when permissions allow', () => {
    render(
      <TestWrapper>
        <UserProfileEditor
          user={mockUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          canEditRole={true}
          canEditStatus={true}
        />
      </TestWrapper>
    );

    // Navigate to Account tab
    const accountTab = screen.getByRole('tab', { name: /account/i });
    fireEvent.click(accountTab);

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Account Status')).toBeInTheDocument();
  });

  it('handles image upload', async () => {
    render(
      <TestWrapper>
        <UserProfileEditor
          user={mockUser}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByRole('button', { name: /upload photo/i });
    
    // Simulate file input change
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(fileInput);
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /change photo/i })).toBeInTheDocument();
    });
  });
});