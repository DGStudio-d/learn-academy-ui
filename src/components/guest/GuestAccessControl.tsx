import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useGuestAccess } from '@/hooks/useGuest';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

interface GuestAccessControlProps {
  contentType: 'languages' | 'teachers' | 'programs' | 'quizzes';
  children: ReactNode;
  fallbackContent?: ReactNode;
  showLoginPrompt?: boolean;
}

export function GuestAccessControl({ 
  contentType, 
  children, 
  fallbackContent,
  showLoginPrompt = true 
}: GuestAccessControlProps) {
  const { t } = useTranslation();
  const { data: hasAccess, isLoading, error } = useGuestAccess(contentType);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    // If there's an error checking access, show a generic error message
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('guest.access.error')}
        </AlertDescription>
      </Alert>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show appropriate message
  if (fallbackContent) {
    return <>{fallbackContent}</>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">
          {t(`guest.access.${contentType}.title`)}
        </CardTitle>
        <CardDescription>
          {t(`guest.access.${contentType}.description`)}
        </CardDescription>
      </CardHeader>
      
      {showLoginPrompt && (
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {t('guest.access.loginPrompt')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/register">
                <UserPlus className="h-4 w-4 mr-2" />
                {t('nav.register')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                {t('nav.login')}
              </Link>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Convenience components for specific content types
export function GuestLanguageAccess({ children, ...props }: Omit<GuestAccessControlProps, 'contentType'>) {
  return (
    <GuestAccessControl contentType="languages" {...props}>
      {children}
    </GuestAccessControl>
  );
}

export function GuestTeacherAccess({ children, ...props }: Omit<GuestAccessControlProps, 'contentType'>) {
  return (
    <GuestAccessControl contentType="teachers" {...props}>
      {children}
    </GuestAccessControl>
  );
}

export function GuestProgramAccess({ children, ...props }: Omit<GuestAccessControlProps, 'contentType'>) {
  return (
    <GuestAccessControl contentType="programs" {...props}>
      {children}
    </GuestAccessControl>
  );
}

export function GuestQuizAccess({ children, ...props }: Omit<GuestAccessControlProps, 'contentType'>) {
  return (
    <GuestAccessControl contentType="quizzes" {...props}>
      {children}
    </GuestAccessControl>
  );
}