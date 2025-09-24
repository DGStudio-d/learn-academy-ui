import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePictureUpload from '@/components/user/ProfilePictureUpload';

// Mock the hooks
vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    uploadState: {
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      failedFiles: [],
      totalFiles: 0,
      completedFiles: 0,
    },
    isUploading: false,
    uploadFiles: vi.fn(),
    resetUpload: vi.fn(),
  }),
}));

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

describe('ProfilePictureUpload Component', () => {
  const mockOnImageUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders avatar with user initials when no image provided', () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders avatar with provided image', () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          currentImageUrl="https://example.com/avatar.jpg"
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveAttribute('alt', 'John Doe');
  });

  it('opens upload dialog when avatar is clicked', async () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    const avatar = screen.getByText('JD').closest('div');
    fireEvent.click(avatar!);

    await waitFor(() => {
      expect(screen.getByText('Update Profile Picture')).toBeInTheDocument();
    });
  });

  it('shows remove button when image exists and showRemoveButton is true', () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          currentImageUrl="https://example.com/avatar.jpg"
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
          showRemoveButton={true}
          onRemove={mockOnRemove}
        />
      </TestWrapper>
    );

    // The remove button should be present but hidden until hover
    const removeButton = document.querySelector('button[class*="absolute"]');
    expect(removeButton).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          currentImageUrl="https://example.com/avatar.jpg"
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
          showRemoveButton={true}
          onRemove={mockOnRemove}
        />
      </TestWrapper>
    );

    const removeButton = document.querySelector('button[class*="absolute"]') as HTMLButtonElement;
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalled();
  });

  it('shows upload button when no image is provided', () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
          size="sm"
        />
      </TestWrapper>
    );

    let avatar = screen.getByText('JD').closest('[class*="h-16 w-16"]');
    expect(avatar).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
          size="xl"
        />
      </TestWrapper>
    );

    avatar = screen.getByText('JD').closest('[class*="h-40 w-40"]');
    expect(avatar).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
          disabled={true}
        />
      </TestWrapper>
    );

    const avatar = screen.getByText('JD').closest('div');
    fireEvent.click(avatar!);

    // Dialog should not open when disabled
    expect(screen.queryByText('Update Profile Picture')).not.toBeInTheDocument();
  });

  it('generates correct initials for different names', () => {
    const { rerender } = render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    expect(screen.getByText('JO')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <ProfilePictureUpload
          userName="Mary Jane Watson"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    expect(screen.getByText('MJ')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <ProfilePictureUpload
          userName="X"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('closes dialog when cancel is clicked', async () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    // Open dialog
    const avatar = screen.getByText('JD').closest('div');
    fireEvent.click(avatar!);

    await waitFor(() => {
      expect(screen.getByText('Update Profile Picture')).toBeInTheDocument();
    });

    // Close dialog
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Update Profile Picture')).not.toBeInTheDocument();
    });
  });

  it('handles file upload in dialog', async () => {
    render(
      <TestWrapper>
        <ProfilePictureUpload
          userName="John Doe"
          onImageUpdate={mockOnImageUpdate}
        />
      </TestWrapper>
    );

    // Open dialog
    const avatar = screen.getByText('JD').closest('div');
    fireEvent.click(avatar!);

    await waitFor(() => {
      expect(screen.getByText('Update Profile Picture')).toBeInTheDocument();
    });

    // Check that file upload area is present
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('JPG, PNG or WebP (max 5MB)')).toBeInTheDocument();
  });
});