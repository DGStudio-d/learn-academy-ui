import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { z } from 'zod';
import { AutoSaveForm } from '@/components/common/forms/AutoSaveForm';
import { FormField } from '@/components/common/forms/FormField';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type TestFormData = z.infer<typeof testSchema>;

const TestFormContent: React.FC<any> = ({ 
  data, 
  errors, 
  setFieldValue, 
  getFieldProps 
}) => (
  <div className="space-y-4">
    <FormField
      name="name"
      label="Name"
      type="text"
      {...getFieldProps('name')}
    />
    <FormField
      name="email"
      label="Email"
      type="email"
      {...getFieldProps('email')}
    />
  </div>
);

describe('AutoSaveForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnAutoSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders form with title and description', () => {
    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        title="Test Form"
        description="This is a test form"
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByText('This is a test form')).toBeInTheDocument();
  });

  it('loads initial data from localStorage when storageKey is provided', () => {
    const savedData = { name: 'John Doe', email: 'john@example.com' };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        storageKey="test-form"
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-form');
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        storageKey="test-form"
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load auto-saved data:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('triggers auto-save after debounce delay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        onAutoSave={mockOnAutoSave}
        autoSaveDelay={1000}
        storageKey="test-form"
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'John');

    // Auto-save should not trigger immediately
    expect(mockOnAutoSave).not.toHaveBeenCalled();

    // Fast-forward time to trigger debounced auto-save
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockOnAutoSave).toHaveBeenCalledWith({ name: 'John' });
    });
  });

  it('saves to localStorage when storageKey is provided', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        autoSaveDelay={500}
        storageKey="test-form"
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'John');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-form',
        JSON.stringify({ name: 'John' })
      );
    });
  });

  it('shows auto-save status indicators', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockOnAutoSave.mockResolvedValue(undefined);

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        onAutoSave={mockOnAutoSave}
        autoSaveDelay={500}
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'John');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should show saving status
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    // Should show saved status after completion
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('handles auto-save errors', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockOnAutoSave.mockRejectedValue(new Error('Auto-save failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        onAutoSave={mockOnAutoSave}
        autoSaveDelay={500}
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'John');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Auto-save failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('triggers periodic auto-save', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockOnAutoSave.mockResolvedValue(undefined);

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        onAutoSave={mockOnAutoSave}
        autoSaveInterval={5000}
        autoSaveDelay={500}
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'John');

    // Wait for debounced save
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockOnAutoSave).toHaveBeenCalledTimes(1);
    });

    // Wait for periodic save
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockOnAutoSave).toHaveBeenCalledTimes(2);
    });
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        storageKey="test-form"
      >
        {(props) => (
          <div>
            <TestFormContent {...props} />
            <button type="submit" onClick={props.handleSubmit}>
              Submit
            </button>
          </div>
        )}
      </AutoSaveForm>
    );

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByText('Submit');

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    // Should clear localStorage after successful submission
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-form');
  });

  it('shows manual save button when onAutoSave is provided', () => {
    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        onAutoSave={mockOnAutoSave}
        title="Test Form"
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('displays last saved time', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockOnAutoSave.mockResolvedValue(undefined);

    render(
      <AutoSaveForm
        schema={testSchema}
        onSubmit={mockOnSubmit}
        onAutoSave={mockOnAutoSave}
        autoSaveDelay={500}
      >
        {(props) => <TestFormContent {...props} />}
      </AutoSaveForm>
    );

    const nameInput = screen.getByLabelText('Name');
    await user.type(nameInput, 'John');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText(/Last saved:/)).toBeInTheDocument();
    });
  });
});