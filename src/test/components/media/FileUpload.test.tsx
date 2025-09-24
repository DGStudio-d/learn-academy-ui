import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileUpload from '@/components/ui/file-upload';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('FileUpload Component', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnFileRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area with default content', () => {
    render(
      <FileUpload onFileSelect={mockOnFileSelect} />
    );

    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('Max size: 10MB')).toBeInTheDocument();
  });

  it('displays custom allowed types and max size', () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        allowedTypes={['image/jpeg', 'image/png']}
        maxSize={5}
      />
    );

    expect(screen.getByText('Allowed: image/jpeg, image/png')).toBeInTheDocument();
    expect(screen.getByText('Max size: 5MB')).toBeInTheDocument();
  });

  it('handles file selection through input', async () => {
    render(
      <FileUpload onFileSelect={mockOnFileSelect} />
    );

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
    });
  });

  it('validates file size', async () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        maxSize={1} // 1MB
      />
    );

    // Create a file larger than 1MB
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 1MB/)).toBeInTheDocument();
    });

    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('validates file types', async () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        allowedTypes={['image/jpeg', 'image/png']}
      />
    );

    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [textFile] } });

    await waitFor(() => {
      expect(screen.getByText(/File type not allowed/)).toBeInTheDocument();
    });

    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('shows file preview when enabled', async () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        showPreview={true}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Selected Files')).toBeInTheDocument();
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  it('handles multiple file selection', async () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        multiple={true}
        maxFiles={3}
      />
    );

    const files = [
      new File(['test1'], 'test1.txt', { type: 'text/plain' }),
      new File(['test2'], 'test2.txt', { type: 'text/plain' }),
    ];
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(files);
    });
  });

  it('enforces maximum file count', async () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        multiple={true}
        maxFiles={2}
      />
    );

    const files = [
      new File(['test1'], 'test1.txt', { type: 'text/plain' }),
      new File(['test2'], 'test2.txt', { type: 'text/plain' }),
      new File(['test3'], 'test3.txt', { type: 'text/plain' }),
    ];
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(screen.getByText(/Maximum 2 files allowed/)).toBeInTheDocument();
    });

    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('handles drag and drop events', async () => {
    render(
      <FileUpload onFileSelect={mockOnFileSelect} />
    );

    const uploadArea = screen.getByRole('button');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    // Mock drag events
    const dragOverEvent = new Event('dragover', { bubbles: true });
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });

    fireEvent(uploadArea, dragOverEvent);
    fireEvent(uploadArea, dropEvent);

    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith([file]);
    });
  });

  it('disables upload when disabled prop is true', () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        disabled={true}
      />
    );

    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('removes files when remove button is clicked', async () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        onFileRemove={mockOnFileRemove}
        showPreview={true}
      />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockOnFileRemove).toHaveBeenCalledWith(0);
  });

  it('displays custom children when provided', () => {
    const customContent = <div>Custom Upload Content</div>;
    
    render(
      <FileUpload onFileSelect={mockOnFileSelect}>
        {customContent}
      </FileUpload>
    );

    expect(screen.getByText('Custom Upload Content')).toBeInTheDocument();
    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument();
  });
});