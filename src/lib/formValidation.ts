import React from 'react';
import { z } from 'zod';
import { AuthSecurityManager } from './authSecurity';

// Enhanced validation utilities
export class FormValidationUtils {
  // Real-time validation with debouncing
  static createDebouncedValidator<T>(
    schema: z.ZodSchema<T>,
    delay: number = 300
  ) {
    let timeoutId: NodeJS.Timeout;
    
    return (value: unknown): Promise<{ isValid: boolean; error?: string }> => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            schema.parse(value);
            resolve({ isValid: true });
          } catch (error) {
            if (error instanceof z.ZodError) {
              resolve({ isValid: false, error: error.errors[0]?.message });
            } else {
              resolve({ isValid: false, error: 'Validation failed' });
            }
          }
        }, delay);
      });
    };
  }

  // Conditional validation based on other fields
  static createConditionalSchema<T extends Record<string, any>>(
    baseSchema: z.ZodSchema<T>,
    conditions: Array<{
      when: (data: Partial<T>) => boolean;
      then: z.ZodSchema<any>;
      field: keyof T;
    }>
  ) {
    return z.preprocess((data) => {
      const typedData = data as Partial<T>;
      let processedData = { ...typedData };

      conditions.forEach(({ when, then, field }) => {
        if (when(typedData)) {
          try {
            processedData[field] = then.parse(typedData[field]);
          } catch (error) {
            // Keep original value if validation fails
          }
        }
      });

      return processedData;
    }, baseSchema);
  }

  // Cross-field validation
  static createCrossFieldValidator<T extends Record<string, any>>(
    validators: Array<{
      fields: (keyof T)[];
      validator: (values: Pick<T, keyof T>) => string | null;
      message: string;
    }>
  ) {
    return (data: Partial<T>): Record<string, string> => {
      const errors: Record<string, string> = {};

      validators.forEach(({ fields, validator, message }) => {
        const fieldValues = fields.reduce((acc, field) => {
          acc[field] = data[field];
          return acc;
        }, {} as any);

        const error = validator(fieldValues);
        if (error) {
          fields.forEach(field => {
            errors[field as string] = message;
          });
        }
      });

      return errors;
    };
  }

  // Async validation for server-side checks
  static createAsyncValidator<T>(
    validator: (value: T) => Promise<boolean>,
    errorMessage: string
  ) {
    return z.string().refine(async (value) => {
      try {
        return await validator(value as T);
      } catch {
        return false;
      }
    }, { message: errorMessage });
  }
}

// Enhanced base schemas with better error messages
export const enhancedEmailSchema = z
  .string()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .refine(
    (email) => {
      // Additional email validation
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      const [local, domain] = parts;
      return local.length <= 64 && domain.length <= 253;
    },
    'Email address format is invalid'
  );

export const enhancedPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
  .refine((password) => {
    const validation = AuthSecurityManager.validatePasswordStrength(password);
    return validation.isValid;
  }, 'Password does not meet security requirements');

export const enhancedNameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .refine(
    (name) => {
      // Check for reasonable name format
      const trimmed = name.trim();
      return trimmed.length >= 2 && !trimmed.startsWith(' ') && !trimmed.endsWith(' ');
    },
    'Please enter a valid name'
  );

export const enhancedPhoneSchema = z
  .string()
  .optional()
  .or(
    z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
      .refine(
        (phone) => {
          // Remove all non-digit characters except +
          const cleaned = phone.replace(/[^\d+]/g, '');
          return cleaned.length >= 7 && cleaned.length <= 15;
        },
        'Phone number must be between 7 and 15 digits'
      )
  );

// Form-specific schemas
export const userProfileSchema = z.object({
  name: enhancedNameSchema,
  email: enhancedEmailSchema,
  phone: enhancedPhoneSchema,
  preferred_language: z.enum(['ar', 'en', 'es'], {
    errorMap: () => ({ message: 'Please select a valid language' })
  }).optional(),
  bio: z
    .string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  profile_image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'Profile image must be less than 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Profile image must be a JPEG, PNG, or WebP file'
    )
    .optional(),
});

export const quizCreationSchema = z.object({
  title: z
    .string()
    .min(1, 'Quiz title is required')
    .min(3, 'Quiz title must be at least 3 characters long')
    .max(200, 'Quiz title is too long'),
  description: z
    .string()
    .max(1000, 'Description is too long')
    .optional(),
  program_id: z
    .number()
    .min(1, 'Please select a program'),
  language_id: z
    .number()
    .min(1, 'Please select a language'),
  time_limit: z
    .number()
    .min(1, 'Time limit must be at least 1 minute')
    .max(480, 'Time limit cannot exceed 8 hours')
    .optional(),
  max_attempts: z
    .number()
    .min(1, 'Must allow at least 1 attempt')
    .max(10, 'Cannot exceed 10 attempts')
    .optional(),
  passing_score: z
    .number()
    .min(0, 'Passing score cannot be negative')
    .max(100, 'Passing score cannot exceed 100%')
    .optional(),
  show_results: z.boolean().default(true),
  allow_review: z.boolean().default(true),
  randomize_questions: z.boolean().default(false),
  randomize_answers: z.boolean().default(false),
  guest_access: z.boolean().default(false),
});

export const meetingCreationSchema = z.object({
  title: z
    .string()
    .min(1, 'Meeting title is required')
    .min(3, 'Meeting title must be at least 3 characters long')
    .max(200, 'Meeting title is too long'),
  description: z
    .string()
    .max(1000, 'Description is too long')
    .optional(),
  program_id: z
    .number()
    .min(1, 'Please select a program'),
  scheduled_at: z
    .date()
    .refine(
      (date) => date > new Date(),
      'Meeting must be scheduled for a future date and time'
    ),
  duration: z
    .number()
    .min(15, 'Meeting must be at least 15 minutes long')
    .max(480, 'Meeting cannot exceed 8 hours'),
  meeting_url: z
    .string()
    .url('Please enter a valid meeting URL')
    .optional(),
  recurring_pattern: z
    .enum(['none', 'daily', 'weekly', 'monthly'])
    .default('none'),
  max_attendees: z
    .number()
    .min(1, 'Must allow at least 1 attendee')
    .max(1000, 'Cannot exceed 1000 attendees')
    .optional(),
});

export const enrollmentSchema = z.object({
  student_id: z
    .number()
    .min(1, 'Please select a student'),
  program_id: z
    .number()
    .min(1, 'Please select a program'),
  enrollment_date: z
    .date()
    .optional()
    .default(() => new Date()),
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
});

export const contactFormSchema = z.object({
  name: enhancedNameSchema,
  email: enhancedEmailSchema,
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters long')
    .max(200, 'Subject is too long'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters long')
    .max(2000, 'Message is too long'),
  category: z
    .enum(['general', 'technical', 'billing', 'feedback'])
    .optional(),
});

// Multi-step form schemas
export const studentRegistrationStep1Schema = z.object({
  name: enhancedNameSchema,
  email: enhancedEmailSchema,
  phone: enhancedPhoneSchema,
});

export const studentRegistrationStep2Schema = z.object({
  password: enhancedPasswordSchema,
  password_confirmation: z.string(),
  preferred_language: z.enum(['ar', 'en', 'es']),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const studentRegistrationStep3Schema = z.object({
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  interests: z
    .array(z.string())
    .min(1, 'Please select at least one area of interest')
    .max(5, 'Please select no more than 5 areas of interest'),
  goals: z
    .string()
    .max(500, 'Goals description is too long')
    .optional(),
  availability: z.object({
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    time_preference: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
  }),
});

// Validation error formatting
export const formatValidationErrors = (errors: z.ZodError): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    formattedErrors[path] = error.message;
  });
  
  return formattedErrors;
};

// Real-time validation hook
export const useRealTimeValidation = <T>(
  schema: z.ZodSchema<T>,
  value: unknown,
  delay: number = 300
) => {
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | undefined>();
  const [isValidating, setIsValidating] = React.useState(false);

  React.useEffect(() => {
    if (value === undefined || value === null || value === '') {
      setIsValid(null);
      setError(undefined);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    const timeoutId = setTimeout(() => {
      try {
        schema.parse(value);
        setIsValid(true);
        setError(undefined);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setIsValid(false);
          setError(err.errors[0]?.message);
        }
      } finally {
        setIsValidating(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, schema, delay]);

  return { isValid, error, isValidating };
};

// Type exports
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type QuizCreationFormData = z.infer<typeof quizCreationSchema>;
export type MeetingCreationFormData = z.infer<typeof meetingCreationSchema>;
export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type StudentRegistrationStep1Data = z.infer<typeof studentRegistrationStep1Schema>;
export type StudentRegistrationStep2Data = z.infer<typeof studentRegistrationStep2Schema>;
export type StudentRegistrationStep3Data = z.infer<typeof studentRegistrationStep3Schema>;