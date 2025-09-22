import { z } from 'zod';
import { AuthSecurityManager } from './authSecurity';

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .refine((password) => {
    const validation = AuthSecurityManager.validatePasswordStrength(password);
    return validation.isValid;
  }, 'Password does not meet security requirements');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-ZÀ-ÿ\u0600-\u06FF\s]+$/, 'Name can only contain letters and spaces');

export const phoneSchema = z
  .string()
  .optional()
  .or(z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'));

// Auth Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: z.string(),
  role: z.enum(['student', 'teacher']).optional().default('student'),
  phone: phoneSchema,
  preferred_language: z.enum(['ar', 'en', 'es']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: passwordSchema,
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'New passwords do not match',
  path: ['password_confirmation'],
});

// Contact Form Schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must not exceed 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must not exceed 2000 characters'),
});

// Validation utility functions
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown): { isValid: boolean; error?: string } => {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
} => {
  try {
    const validData = schema.parse(data);
    return { isValid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeName = (name: string): string => {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '');
};

// Type inference helpers
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;