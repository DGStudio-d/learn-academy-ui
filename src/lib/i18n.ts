import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import local translation resources as fallback
import enTranslations from './translations/en.json';
import arTranslations from './translations/ar.json';
import esTranslations from './translations/es.json';

// Local translation resources (fallback)
const localResources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  },
  es: {
    translation: esTranslations
  }
};

// RTL languages
export const RTL_LANGUAGES = ['ar'];

// Default language configuration (will be enhanced by API data)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
];

// Custom backend to load translations from API with fallback to local
const customBackend = {
  type: 'backend' as const,
  init: () => {},
  read: async (language: string, namespace: string, callback: (err: any, data?: any) => void) => {
    try {
      // Try to load from API first
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/translations/${language}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          callback(null, data.data);
          return;
        }
      }

      // Fallback to local translations
      const localData = localResources[language as keyof typeof localResources]?.translation;
      if (localData) {
        callback(null, localData);
      } else {
        // If no local translation exists, fallback to English
        callback(null, localResources.en.translation);
      }
    } catch (error) {
      // On any error, use local fallback
      const localData = localResources[language as keyof typeof localResources]?.translation;
      if (localData) {
        callback(null, localData);
      } else {
        callback(null, localResources.en.translation);
      }
    }
  }
};

i18n
  .use(customBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'preferredLanguage',
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },

    // Backend configuration
    backend: {
      loadPath: '/api/translations/{{lng}}',
      allowMultiLoading: false,
    },

    // Load local resources as initial data
    resources: localResources,
  });

// Function to dynamically load translations from API
export const loadApiTranslations = async (language: string): Promise<any> => {
  try {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/translations/${language}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        // Add the API translations to i18n
        i18n.addResourceBundle(language, 'translation', data.data, true, true);
        return data.data;
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to load API translations for ${language}:`, error);
    return null;
  }
};

// Function to merge API translations with local ones
export const mergeTranslations = (local: any, api: any): any => {
  if (!api) return local;
  
  const merged = { ...local };
  
  const mergeRecursive = (target: any, source: any) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        mergeRecursive(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  };
  
  mergeRecursive(merged, api);
  return merged;
};

// Function to get user's preferred language from various sources
export const getUserPreferredLanguage = (): string => {
  // Check localStorage first
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && SUPPORTED_LANGUAGES.some(lang => lang.code === stored)) {
    return stored;
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang)) {
    return browserLang;
  }
  
  // Default to English
  return 'en';
};

// Function to update document attributes for RTL support
export const updateDocumentDirection = (language: string) => {
  const html = document.documentElement;
  const isRTL = RTL_LANGUAGES.includes(language);
  
  // Set language attribute
  html.setAttribute('lang', language);
  
  // Set direction attribute
  html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  
  // Add/remove RTL class for styling
  if (isRTL) {
    html.classList.add('rtl');
  } else {
    html.classList.remove('rtl');
  }
};

// Initialize document direction on load
updateDocumentDirection(getUserPreferredLanguage());

export default i18n;