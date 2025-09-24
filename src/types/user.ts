// User form data interfaces
export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  preferred_language?: 'ar' | 'en' | 'es';
  is_active?: boolean;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'teacher' | 'student';
  phone?: string;
  preferred_language?: 'ar' | 'en' | 'es';
  is_active?: boolean;
}