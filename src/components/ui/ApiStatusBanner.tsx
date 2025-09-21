import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { healthService } from '@/services/healthService';

export function ApiStatusBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isApiDown, setIsApiDown] = useState(false);
  const [apiStatus, setApiStatus] = useState<{
    available: boolean;
    baseURL: string;
    timestamp: string;
  } | null>(null);
  const { t } = useTranslation();
  const isDevelopment = import.meta.env.MODE === 'development';

  useEffect(() => {
    // Listen for API errors
    const handleApiError = (event: any) => {
      if (event.detail?.status === 403 || event.detail?.status === 500) {
        setIsApiDown(true);
        setIsVisible(true);
      }
    };

    // Listen for console warnings about fallback data
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes('API not available')) {
        setIsApiDown(true);
        setIsVisible(true);
      }
      originalWarn.apply(console, args);
    };

    // Check if we're already showing fallback data
    const checkApiStatus = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api' + '/health');
        if (!response.ok) {
          setIsApiDown(true);
          setIsVisible(true);
        }
      } catch (error) {
        setIsApiDown(true);
        setIsVisible(true);
      }
    };

    // Check API status on mount with a delay to avoid showing banner during normal loading
    const checkInitialApiStatus = async () => {
      try {
        const status = await healthService.getStatus();
        setApiStatus(status);
        if (!status.available) {
          setIsApiDown(true);
          setIsVisible(true);
        }
      } catch (error) {
        setIsApiDown(true);
        setIsVisible(true);
      }
    };

    const timer = setTimeout(checkInitialApiStatus, 2000);

    window.addEventListener('api:error', handleApiError);

    return () => {
      window.removeEventListener('api:error', handleApiError);
      console.warn = originalWarn;
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const bannerClass = isApiDown 
    ? "fixed top-0 left-0 right-0 z-50 rounded-none border-l-0 border-r-0 border-t-0 bg-yellow-50 border-yellow-200 text-yellow-800"
    : "fixed top-0 left-0 right-0 z-50 rounded-none border-l-0 border-r-0 border-t-0 bg-blue-50 border-blue-200 text-blue-800";

  const message = isApiDown 
    ? t('common.apiOffline', 'Backend API is not available. Showing demo content for preview purposes.')
    : 'API Status: Connected';

  return (
    <Alert className={bannerClass}>
      {isApiDown ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span>{message}</span>
          {isDevelopment && apiStatus && (
            <span className="text-xs opacity-75">
              {apiStatus.baseURL} • {new Date(apiStatus.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className={isApiDown 
            ? "text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100"
            : "text-blue-800 hover:text-blue-900 hover:bg-blue-100"
          }
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}