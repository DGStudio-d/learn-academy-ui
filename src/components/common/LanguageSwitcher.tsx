import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'default',
  showFlag = true,
  showName = true,
  className,
}) => {
  const { t } = useTranslation();
  const {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
    isLoadingLanguages,
    isLoadingTranslations,
  } = useLanguage();

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);
  const isLoading = isLoadingLanguages || isLoadingTranslations;

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
  };

  const renderTrigger = () => {
    if (variant === 'icon-only') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 w-8 p-0', className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>
      );
    }

    if (variant === 'compact') {
      return (
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 px-2 gap-1', className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              {showFlag && currentLang && (
                <span className="text-sm">{currentLang.flag}</span>
              )}
              {showName && (
                <span className="text-xs font-medium uppercase">
                  {currentLanguage}
                </span>
              )}
            </>
          )}
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2', className)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        {showFlag && currentLang && (
          <span>{currentLang.flag}</span>
        )}
        {showName && currentLang && (
          <span>{currentLang.name}</span>
        )}
      </Button>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {renderTrigger()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages
          .filter(lang => lang.is_active)
          .map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                'flex items-center justify-between cursor-pointer',
                language.direction === 'rtl' && 'flex-row-reverse'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {language.direction === 'rtl' && (
                  <Badge variant="secondary" className="text-xs">
                    RTL
                  </Badge>
                )}
              </div>
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        
        {isLoadingLanguages && (
          <DropdownMenuItem disabled className="justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t('common.loading')}
          </DropdownMenuItem>
        )}
        
        {supportedLanguages.length === 0 && !isLoadingLanguages && (
          <DropdownMenuItem disabled className="text-center text-muted-foreground">
            {t('common.error')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};