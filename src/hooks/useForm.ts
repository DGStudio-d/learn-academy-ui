import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { validateForm, validateField, sanitizeInput } from '../lib/validation';
import { toast } from '@/hooks/use-toast';

// Form state interface
interface FormState<T> {
  data: Partial<T>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Form options
interface UseFormOptions<T> {
  schema: z.ZodSchema<T>;
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  sanitizeFields?: (keyof T)[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

// Enhanced form hook
export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const {
    schema,
    initialData = {},
    onSubmit,
    sanitizeFields = [],
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false,
  } = options;

  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
    isDirty: false,
  });

  // Validate entire form
  const validateFormData = useCallback((data: Partial<T>) => {
    const validation = validateForm(schema, data);
    return validation;
  }, [schema]);

  // Validate single field
  const validateSingleField = useCallback((name: keyof T, value: any) => {
    try {
      const fieldSchema = schema?.shape[name as string];
      if (fieldSchema) {
        const validation = validateField(fieldSchema, value);
        return validation;
      }
      return { isValid: true };
    } catch {
      return { isValid: true };
    }
  }, [schema]);

  // Update field value
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setState(prev => {
      const newData = { ...prev.data, [name]: value };
      const newState = {
        ...prev,
        data: newData,
        isDirty: true,
      };

      // Validate on change if enabled
      if (validateOnChange && prev.touched[name as string]) {
        const fieldValidation = validateSingleField(name, value);
        if (!fieldValidation.isValid) {
          newState.errors = {
            ...prev.errors,
            [name]: fieldValidation.error || 'Invalid value',
          };
        } else {
          const { [name as string]: _, ...remainingErrors } = prev.errors;
          newState.errors = remainingErrors;
        }
      }

      // Update overall form validity
      const formValidation = validateFormData(newData);
      newState.isValid = formValidation.isValid;

      return newState;
    });
  }, [validateOnChange, validateSingleField, validateFormData]);

  // Set field error
  const setFieldError = useCallback((name: keyof T, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: error
        ? { ...prev.errors, [name]: error }
        : { ...prev.errors, [name]: undefined },
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((name: keyof T, touched = true) => {
    setState(prev => {
      const newState = {
        ...prev,
        touched: { ...prev.touched, [name as string]: touched },
      };

      // Validate on blur if enabled and field is now touched
      if (validateOnBlur && touched) {
        const value = prev.data[name];
        const fieldValidation = validateSingleField(name, value);
        if (!fieldValidation.isValid) {
          newState.errors = {
            ...prev.errors,
            [name]: fieldValidation.error || 'Invalid value',
          };
        }
      }

      return newState;
    });
  }, [validateOnBlur, validateSingleField]);

  // Handle input change
  const handleChange = useCallback((name: keyof T) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let value: any = event.target.value;

      // Sanitize input if specified
      if (sanitizeFields.includes(name) && typeof value === 'string') {
        value = sanitizeInput(value);
      }

      // Handle different input types
      if (event.target.type === 'checkbox') {
        value = (event.target as HTMLInputElement).checked;
      } else if (event.target.type === 'number') {
        value = value === '' ? undefined : Number(value);
      }

      setFieldValue(name, value);
    };
  }, [sanitizeFields, setFieldValue]);

  // Handle input blur
  const handleBlur = useCallback((name: keyof T) => {
    return () => {
      setFieldTouched(name, true);
    };
  }, [setFieldTouched]);

  // Submit form
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Mark all fields as touched
      const allTouched = Object.keys(state.data).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      
      setState(prev => ({ ...prev, touched: allTouched }));

      // Validate entire form
      const validation = validateFormData(state.data);
      
      if (!validation.isValid) {
        setState(prev => ({
          ...prev,
          errors: validation.errors,
          isSubmitting: false,
        }));
        
        toast({
          title: 'Validation Error',
          description: 'Please check the form for errors and try again.',
          variant: 'destructive',
        });
        return;
      }

      // Submit form
      await onSubmit(validation.data!);
      
      // Reset form if specified
      if (resetOnSubmit) {
        setState({
          data: initialData,
          errors: {},
          touched: {},
          isValid: false,
          isSubmitting: false,
          isDirty: false,
        });
      } else {
        setState(prev => ({ ...prev, isSubmitting: false, isDirty: false }));
      }
      
    } catch (error: any) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      
      // Handle validation errors from server
      if (error?.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, ...serverErrors },
        }));
      }
      
      throw error; // Re-throw to allow component to handle
    }
  }, [state.data, validateFormData, onSubmit, resetOnSubmit, initialData]);

  // Reset form
  const reset = useCallback((newData?: Partial<T>) => {
    setState({
      data: newData || initialData,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialData]);

  // Set form data
  const setData = useCallback((data: Partial<T>) => {
    setState(prev => {
      const validation = validateFormData(data);
      return {
        ...prev,
        data,
        isValid: validation.isValid,
        errors: validation.errors,
        isDirty: true,
      };
    });
  }, [validateFormData]);

  // Get field props for easier integration
  const getFieldProps = useCallback((name: keyof T) => {
    return {
      name: name as string,
      value: state.data[name] || '',
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      error: state.touched[name as string] ? state.errors[name as string] : undefined,
    };
  }, [state.data, state.touched, state.errors, handleChange, handleBlur]);

  return {
    // State
    ...state,
    
    // Actions
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
    reset,
    setData,
    
    // Helpers
    getFieldProps,
    validateFormData,
  };
}

// Specialized hooks for common forms
export function useLoginForm(onSubmit: (data: any) => Promise<void>) {
  const { loginSchema } = require('../lib/validation');
  return useForm({
    schema: loginSchema,
    onSubmit,
    sanitizeFields: ['email'],
  });
}

export function useRegisterForm(onSubmit: (data: any) => Promise<void>) {
  const { registerSchema } = require('../lib/validation');
  return useForm({
    schema: registerSchema,
    onSubmit,
    sanitizeFields: ['name', 'email'],
  });
}

export function useContactForm(onSubmit: (data: any) => Promise<void>) {
  const { contactFormSchema } = require('../lib/validation');
  return useForm({
    schema: contactFormSchema,
    onSubmit,
    sanitizeFields: ['name', 'email', 'subject', 'message'],
    resetOnSubmit: true,
  });
}

// Field validation hook
export function useFieldValidation<T>(schema: z.ZodSchema<T>) {
  const [value, setValue] = useState<T | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const validate = useCallback((newValue: T) => {
    const validation = validateField(schema, newValue);
    setError(validation.error);
    return validation.isValid;
  }, [schema]);

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    if (touched) {
      validate(newValue);
    }
  }, [touched, validate]);

  const handleBlur = useCallback(() => {
    if (!touched) {
      setTouched(true);
      if (value !== undefined) {
        validate(value);
      }
    }
  }, [touched, value, validate]);

  return {
    value,
    error: touched ? error : undefined,
    touched,
    isValid: !error,
    handleChange,
    handleBlur,
    validate,
  };
}