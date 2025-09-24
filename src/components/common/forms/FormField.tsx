import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface FormFieldProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'file';
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  multiple?: boolean;
  accept?: string; // for file inputs
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  step?: number;
  rows?: number; // for textarea
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  description,
  options = [],
  multiple = false,
  accept,
  maxLength,
  minLength,
  min,
  max,
  step,
  rows = 3,
  className,
  inputClassName,
  labelClassName,
  errorClassName,
  autoComplete,
  autoFocus = false,
  readOnly = false,
  size = 'md',
  variant = 'default',
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const baseInputClasses = cn(
    'flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background',
    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[size],
    error && 'border-destructive focus-visible:ring-destructive',
    inputClassName
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value;
    onChange?.(newValue);
  };

  const handleSelectChange = (newValue: string) => {
    onChange?.(newValue);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onChange?.(checked);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    onChange?.(multiple ? Array.from(files || []) : files?.[0] || null);
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={handleInputChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            minLength={minLength}
            rows={rows}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            readOnly={readOnly}
            className={cn(baseInputClasses, 'min-h-[80px] resize-vertical')}
            aria-describedby={cn(
              description && descriptionId,
              error && errorId
            )}
            aria-invalid={!!error}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleSelectChange}
            disabled={disabled}
            required={required}
          >
            <SelectTrigger
              id={fieldId}
              className={cn(baseInputClasses, error && 'border-destructive')}
              aria-describedby={cn(
                description && descriptionId,
                error && errorId
              )}
              aria-invalid={!!error}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              name={name}
              checked={value || false}
              onCheckedChange={handleCheckboxChange}
              disabled={disabled}
              required={required}
              className={error ? 'border-destructive' : ''}
              aria-describedby={cn(
                description && descriptionId,
                error && errorId
              )}
              aria-invalid={!!error}
            />
            {label && (
              <Label
                htmlFor={fieldId}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  error && 'text-destructive',
                  labelClassName
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled}
            required={required}
            className="flex flex-col space-y-2"
            aria-describedby={cn(
              description && descriptionId,
              error && errorId
            )}
            aria-invalid={!!error}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${fieldId}-${option.value}`}
                  disabled={option.disabled}
                />
                <Label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={fieldId}
              name={name}
              checked={value || false}
              onCheckedChange={handleCheckboxChange}
              disabled={disabled}
              required={required}
              aria-describedby={cn(
                description && descriptionId,
                error && errorId
              )}
              aria-invalid={!!error}
            />
            {label && (
              <Label
                htmlFor={fieldId}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  error && 'text-destructive',
                  labelClassName
                )}
              >
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
          </div>
        );

      case 'file':
        return (
          <Input
            id={fieldId}
            name={name}
            type="file"
            onChange={handleFileChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            multiple={multiple}
            accept={accept}
            autoFocus={autoFocus}
            className={cn(
              baseInputClasses,
              'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground'
            )}
            aria-describedby={cn(
              description && descriptionId,
              error && errorId
            )}
            aria-invalid={!!error}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              id={fieldId}
              name={name}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              value={value || ''}
              onChange={handleInputChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              maxLength={maxLength}
              minLength={minLength}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              readOnly={readOnly}
              className={cn(baseInputClasses, 'pr-10')}
              aria-describedby={cn(
                description && descriptionId,
                error && errorId
              )}
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        );

      default:
        return (
          <Input
            id={fieldId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value || ''}
            onChange={handleInputChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            minLength={minLength}
            min={min}
            max={max}
            step={step}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            readOnly={readOnly}
            className={baseInputClasses}
            aria-describedby={cn(
              description && descriptionId,
              error && errorId
            )}
            aria-invalid={!!error}
          />
        );
    }
  };

  // For checkbox and switch, we render the label inline
  if (type === 'checkbox' || type === 'switch') {
    return (
      <div className={cn('space-y-2', className)}>
        {renderInput()}
        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <div id={errorId} className={cn('flex items-center gap-2 text-sm text-destructive', errorClassName)}>
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-destructive',
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {renderInput()}
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <div id={errorId} className={cn('flex items-center gap-2 text-sm text-destructive', errorClassName)}>
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};