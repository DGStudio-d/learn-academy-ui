import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, RefreshCw } from 'lucide-react';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageDemo() {
  const { t } = useTranslation();
  const { 
    currentLanguage, 
    isRTL, 
    supportedLanguages, 
    isLoadingLanguages, 
    isLoadingTranslations,
    refreshTranslations 
  } = useLanguage();

  const currentLangConfig = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('landing.hero.subtitle')}
        </p>
        
        <div className="flex justify-center gap-4">
          <LanguageSwitcher />
          <LanguageSwitcher variant="compact" />
          <LanguageSwitcher variant="icon-only" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('admin.translations.currentLanguage', 'Current Language')}
            </CardTitle>
            <CardDescription>
              {t('admin.translations.languageInfo', 'Language configuration and status')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>{t('admin.translations.language', 'Language')}:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentLangConfig?.flag}</span>
                <span className="font-semibold">{currentLangConfig?.name}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>{t('admin.translations.code', 'Code')}:</span>
              <Badge variant="secondary">{currentLanguage}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>{t('admin.translations.direction', 'Direction')}:</span>
              <Badge variant={isRTL ? 'default' : 'secondary'}>
                {isRTL ? 'RTL' : 'LTR'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>{t('admin.translations.status', 'Status')}:</span>
              <Badge variant={isLoadingTranslations ? 'destructive' : 'default'}>
                {isLoadingTranslations ? t('common.loading') : t('common.ready', 'Ready')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.translations.availableLanguages', 'Available Languages')}</CardTitle>
            <CardDescription>
              {t('admin.translations.supportedLanguages', 'All supported languages')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportedLanguages
                .filter(lang => lang.is_active)
                .map((language) => (
                  <div 
                    key={language.code}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      language.code === currentLanguage ? 'bg-primary/10 border-primary' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{language.flag}</span>
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">{language.code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {language.direction === 'rtl' && (
                        <Badge variant="secondary" className="text-xs">RTL</Badge>
                      )}
                      {language.code === currentLanguage && (
                        <Badge variant="default" className="text-xs">
                          {t('admin.translations.active', 'Active')}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
            
            {isLoadingLanguages && (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.translations.sampleContent', 'Sample Content')}</CardTitle>
          <CardDescription>
            {t('admin.translations.demonstrateTranslations', 'Demonstrating dynamic translations')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">{t('nav.home', 'Navigation')}</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t('nav.home')}</li>
                <li>• {t('nav.languages')}</li>
                <li>• {t('nav.teachers')}</li>
                <li>• {t('nav.about')}</li>
                <li>• {t('nav.contact')}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">{t('common.actions', 'Common Actions')}</h3>
              <ul className="space-y-1 text-sm">
                <li>• {t('common.save')}</li>
                <li>• {t('common.cancel')}</li>
                <li>• {t('common.edit')}</li>
                <li>• {t('common.delete')}</li>
                <li>• {t('common.search')}</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span>{t('admin.translations.refreshTranslations', 'Refresh Translations')}:</span>
              <Button 
                onClick={refreshTranslations}
                variant="outline" 
                size="sm"
                disabled={isLoadingTranslations}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingTranslations ? 'animate-spin' : ''}`} />
                {t('common.refresh', 'Refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageDemo;
