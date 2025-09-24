// Core form components
export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { AutoSaveForm, useAutoSave } from './AutoSaveForm';
export type { AutoSaveFormProps } from './AutoSaveForm';

export { MultiStepForm } from './MultiStepForm';
export type { MultiStepFormProps, FormStep } from './MultiStepForm';

export { FormBuilder } from './FormBuilder';
export type { FormBuilderProps, FormFieldConfig, FormSection } from './FormBuilder';

// Example implementations
export { UserProfileForm } from './examples/UserProfileForm';
export { StudentRegistrationForm } from './examples/StudentRegistrationForm';

// Re-export validation utilities
export {
  FormValidationUtils,
  enhancedEmailSchema,
  enhancedPasswordSchema,
  enhancedNameSchema,
  enhancedPhoneSchema,
  userProfileSchema,
  quizCreationSchema,
  meetingCreationSchema,
  enrollmentSchema,
  contactFormSchema,
  studentRegistrationStep1Schema,
  studentRegistrationStep2Schema,
  studentRegistrationStep3Schema,
  formatValidationErrors,
  useRealTimeValidation,
} from '@/lib/formValidation';

export type {
  UserProfileFormData,
  QuizCreationFormData,
  MeetingCreationFormData,
  EnrollmentFormData,
  ContactFormData,
  StudentRegistrationStep1Data,
  StudentRegistrationStep2Data,
  StudentRegistrationStep3Data,
} from '@/lib/formValidation';