import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES, SUPPORTED_LANGUAGES } from '../lib/i18n';

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  changeLanguage: (language: string) => void;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
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
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState(RTL_LANGUAGES.includes(currentLanguage));

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      setIsRTL(RTL_LANGUAGES.includes(language));
      
      // Store the language preference
      localStorage.setItem('preferredLanguage', language);
      
      // Update document direction and lang attributes
      updateDocumentAttributes(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const updateDocumentAttributes = (language: string) => {
    const html = document.documentElement;
    const isRTLLang = RTL_LANGUAGES.includes(language);
    
    // Set language attribute
    html.setAttribute('lang', language);
    
    // Set direction attribute
    html.setAttribute('dir', isRTLLang ? 'rtl' : 'ltr');
    
    // Add/remove RTL class for styling
    if (isRTLLang) {
      html.classList.add('rtl');
    } else {
      html.classList.remove('rtl');
    }
  };

  useEffect(() => {
    // Initialize document attributes on mount
    updateDocumentAttributes(currentLanguage);
    
    // Listen for language changes from i18n
    const handleLanguageChanged = (lng: string) => {
      if (lng !== currentLanguage) {
        setCurrentLanguage(lng);
        setIsRTL(RTL_LANGUAGES.includes(lng));
        updateDocumentAttributes(lng);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [currentLanguage, i18n]);

  const value: LanguageContextType = {
    currentLanguage,
    isRTL,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};