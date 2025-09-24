import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES, SUPPORTED_LANGUAGES, loadApiTranslations, updateDocumentDirection, getUserPreferredLanguage } from '../lib/i18n';
import { useAvailableLanguages, useUpdateLanguagePreference, useApiTranslations } from '../hooks/useTranslations';
import { useAuth } from './AuthContext';
import type { LanguageConfig } from '../services/translationService';

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  changeLanguage: (language: string) => void;
  supportedLanguages: LanguageConfig[];
  isLoadingLanguages: boolean;
  isLoadingTranslations: boolean;
  refreshTranslations: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize with user preference, stored preference, or detected language
    return user?.preferred_language || getUserPreferredLanguage();
  });
  const [isRTL, setIsRTL] = useState(RTL_LANGUAGES.includes(currentLanguage));

  // Fetch available languages from API
  const { 
    data: apiLanguages, 
    isLoading: isLoadingLanguages,
    error: languagesError 
  } = useAvailableLanguages();

  // Fetch current language translations from API
  const { 
    data: apiTranslations, 
    isLoading: isLoadingTranslations,
    refetch: refetchTranslations 
  } = useApiTranslations(currentLanguage);

  // Mutation for updating user language preference
  const updateLanguagePreference = useUpdateLanguagePreference();

  // Use API languages if available, otherwise fall back to default
  const supportedLanguages = apiLanguages || SUPPORTED_LANGUAGES.map(lang => ({
    ...lang,
    is_active: true
  }));

  const changeLanguage = async (language: string) => {
    try {
      // Load API translations for the new language
      await loadApiTranslations(language);
      
      // Change i18n language
      await i18n.changeLanguage(language);
      
      // Update state
      setCurrentLanguage(language);
      setIsRTL(RTL_LANGUAGES.includes(language));
      
      // Store the language preference locally
      localStorage.setItem('preferredLanguage', language);
      
      // Update document direction and lang attributes
      updateDocumentDirection(language);
      
      // Update user preference on server (if authenticated)
      if (user) {
        updateLanguagePreference.mutate(language);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      // Still update the UI even if API calls fail
      setCurrentLanguage(language);
      setIsRTL(RTL_LANGUAGES.includes(language));
      localStorage.setItem('preferredLanguage', language);
      updateDocumentDirection(language);
    }
  };

  const refreshTranslations = () => {
    refetchTranslations();
  };

  // Initialize language on mount and when user changes
  useEffect(() => {
    const initializeLanguage = async () => {
      let targetLanguage = currentLanguage;

      // If user is authenticated and has a preferred language, use that
      if (user?.preferred_language && user.preferred_language !== currentLanguage) {
        targetLanguage = user.preferred_language;
      }

      // Load API translations for the target language
      await loadApiTranslations(targetLanguage);
      
      // Set the language in i18n
      if (i18n.language !== targetLanguage) {
        await i18n.changeLanguage(targetLanguage);
      }
      
      // Update state and document
      setCurrentLanguage(targetLanguage);
      setIsRTL(RTL_LANGUAGES.includes(targetLanguage));
      updateDocumentDirection(targetLanguage);
      
      // Store preference
      localStorage.setItem('preferredLanguage', targetLanguage);
    };

    initializeLanguage();
  }, [user?.preferred_language, i18n]);

  // Listen for i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (lng !== currentLanguage) {
        setCurrentLanguage(lng);
        setIsRTL(RTL_LANGUAGES.includes(lng));
        updateDocumentDirection(lng);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [currentLanguage, i18n]);

  // Load API translations when they become available
  useEffect(() => {
    if (apiTranslations) {
      // Merge API translations with existing ones
      i18n.addResourceBundle(currentLanguage, 'translation', apiTranslations, true, true);
    }
  }, [apiTranslations, currentLanguage, i18n]);

  // Log language loading errors (but don't break the app)
  useEffect(() => {
    if (languagesError) {
      console.warn('Failed to load languages from API, using default configuration:', languagesError);
    }
  }, [languagesError]);

  const value: LanguageContextType = {
    currentLanguage,
    isRTL,
    changeLanguage,
    supportedLanguages,
    isLoadingLanguages,
    isLoadingTranslations,
    refreshTranslations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};