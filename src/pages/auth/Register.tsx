import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../../hooks/useAuth';
import { useRegisterForm } from '../../hooks/useForm';
import type { RegisterRequest } from '../../types/api';

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
];

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerMutation = useRegister();

  // Enhanced form with validation
  const form = useRegisterForm(async (data) => {
    try {
      const result = await registerMutation.mutateAsync(data);
      
      // Redirect based on user role
      const roleRedirects = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/dashboard',
      };
      
      const redirectPath = roleRedirects[result.user.role as keyof typeof roleRedirects] || '/dashboard';
      navigate(redirectPath, { replace: true });
      
    } catch (error: any) {
      // Error handling is done by the mutation hook
      throw error;
    }
  });

  const handleSelectChange = (name: string, value: string) => {
    form.setFieldValue(name as keyof RegisterRequest, value);
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Learn Academy and start your language journey"
    >
      <form onSubmit={form.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.getFieldProps('name')}
              placeholder="John Doe"
              required
            />
            {form.getFieldProps('name').error && (
              <p className="text-sm text-destructive">{form.getFieldProps('name').error}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              {...form.getFieldProps('phone')}
              placeholder="+1-234-567-8900"
            />
            {form.getFieldProps('phone').error && (
              <p className="text-sm text-destructive">{form.getFieldProps('phone').error}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...form.getFieldProps('email')}
            type="email"
            placeholder="john@example.com"
            required
          />
          {form.getFieldProps('email').error && (
            <p className="text-sm text-destructive">{form.getFieldProps('email').error}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              {...form.getFieldProps('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.getFieldProps('password').error && (
            <p className="text-sm text-destructive">{form.getFieldProps('password').error}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <Input
            id="password_confirmation"
            {...form.getFieldProps('password_confirmation')}
            type="password"
            placeholder="Confirm your password"
            required
          />
          {form.getFieldProps('password_confirmation').error && (
            <p className="text-sm text-destructive">{form.getFieldProps('password_confirmation').error}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_language">Preferred Language</Label>
          <Select 
            value={form.data.preferred_language || 'en'} 
            onValueChange={(value) => handleSelectChange('preferred_language', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">I want to</Label>
          <Select 
            value={form.data.role || 'student'} 
            onValueChange={(value) => handleSelectChange('role', value as 'student' | 'teacher')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Learn a language (Student)</SelectItem>
              <SelectItem value="teacher">Teach a language (Teacher)</SelectItem>
            </SelectContent>
          </Select>
          {form.errors.role && (
            <p className="text-sm text-destructive">{form.errors.role}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full btn-hero"
          disabled={form.isSubmitting || !form.isValid}
        >
          {form.isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}