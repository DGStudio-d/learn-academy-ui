import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FormField } from '@/components/common/forms/FormField';

describe('FormField Component', () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnBlur.mockClear();
  });

  it('renders text input correctly', () => {
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        placeholder="Enter text"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        required
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message when error is provided', () => {
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        error="This field is required"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays description when provided', () => {
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        description="This is a helpful description"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByText('This is a helpful description')).toBeInTheDocument();
  });

  it('handles text input changes', async () => {
    const user = userEvent.setup();
    
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(mockOnChange).toHaveBeenCalledTimes(11); // One for each character
  });

  it('handles blur events', async () => {
    const user = userEvent.setup();
    
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('renders select field correctly', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    render(
      <FormField
        name="test"
        label="Test Select"
        type="select"
        options={options}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders textarea correctly', () => {
    render(
      <FormField
        name="test"
        label="Test Textarea"
        type="textarea"
        rows={5}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders checkbox correctly', () => {
    render(
      <FormField
        name="test"
        label="Test Checkbox"
        type="checkbox"
        value={false}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
  });

  it('handles checkbox changes', async () => {
    const user = userEvent.setup();
    
    render(
      <FormField
        name="test"
        label="Test Checkbox"
        type="checkbox"
        value={false}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('renders password field with toggle button', () => {
    render(
      <FormField
        name="test"
        label="Password"
        type="password"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    
    render(
      <FormField
        name="test"
        label="Password"
        type="password"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles number input correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <FormField
        name="test"
        label="Number Field"
        type="number"
        min={0}
        max={100}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByRole('spinbutton');
    await user.type(input, '42');

    expect(mockOnChange).toHaveBeenCalledWith(4);
    expect(mockOnChange).toHaveBeenCalledWith(42);
  });

  it('disables field when disabled prop is true', () => {
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        disabled
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(
      <FormField
        name="test"
        label="Test Field"
        type="text"
        className="custom-class"
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByRole('textbox').closest('.custom-class')).toBeInTheDocument();
  });

  it('handles file input correctly', () => {
    render(
      <FormField
        name="test"
        label="File Upload"
        type="file"
        accept="image/*"
        multiple
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByLabelText('File Upload');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/*');
    expect(input).toHaveAttribute('multiple');
  });

  it('renders radio group correctly', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    render(
      <FormField
        name="test"
        label="Test Radio"
        type="radio"
        options={options}
        value=""
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('renders switch correctly', () => {
    render(
      <FormField
        name="test"
        label="Test Switch"
        type="switch"
        value={false}
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByText('Test Switch')).toBeInTheDocument();
  });
});