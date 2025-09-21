import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.languages': 'Languages',
      'nav.teachers': 'Teachers',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.dashboard': 'Dashboard',
      'nav.logout': 'Logout',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.submit': 'Submit',
      'common.search': 'Search',
      'common.apiOffline': 'Backend API is not available. Showing demo content for preview purposes.',
      
      // Landing Page
      'landing.hero.title': 'Master New Languages with Expert Teachers',
      'landing.hero.subtitle': 'Join thousands of students learning languages through interactive lessons, live sessions, and personalized guidance from native speakers.',
      'landing.hero.cta': 'Start Learning Free',
      'landing.hero.demo': 'Watch Demo',
      'landing.features.title': 'Why Choose Learn Academy',
      'landing.teachers.title': 'Meet Our Expert Teachers',
      
      // Languages Page
      'languages.title': 'Choose Your Language',
      'languages.subtitle': 'Explore our comprehensive language programs taught by native speakers and expert instructors.',
      'languages.cta': 'Start Learning Today',
      
      // Teachers Page
      'teachers.title': 'Meet Our Expert Teachers',
      'teachers.subtitle': 'Learn from certified instructors and native speakers who are passionate about helping you succeed.',
      
      // Auth
      'auth.login.title': 'Welcome Back',
      'auth.register.title': 'Create Account',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Full Name',
      'auth.phone': 'Phone Number',
      'auth.role': 'Role',
      'auth.language': 'Preferred Language',
    }
  },
  ar: {
    translation: {
      // Navigation
      'nav.home': 'الرئيسية',
      'nav.languages': 'اللغات',
      'nav.teachers': 'المعلمون',
      'nav.about': 'حول',
      'nav.contact': 'اتصل بنا',
      'nav.login': 'تسجيل الدخول',
      'nav.register': 'إنشاء حساب',
      'nav.dashboard': 'لوحة التحكم',
      'nav.logout': 'تسجيل الخروج',
      
      // Common
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      'common.save': 'حفظ',
      'common.cancel': 'إلغاء',
      'common.confirm': 'تأكيد',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.view': 'عرض',
      'common.submit': 'إرسال',
      'common.search': 'بحث',
      'common.apiOffline': 'خادم API غير متاح. يتم عرض المحتوى التجريبي للمعاينة.',
      
      // Landing Page
      'landing.hero.title': 'اتقن لغات جديدة مع معلمين خبراء',
      'landing.hero.subtitle': 'انضم إلى آلاف الطلاب الذين يتعلمون اللغات من خلال دروس تفاعلية وجلسات مباشرة وإرشاد شخصي من متحدثين أصليين.',
      'landing.hero.cta': 'ابدأ التعلم مجاناً',
      'landing.hero.demo': 'شاهد العرض التوضيحي',
      'landing.features.title': 'لماذا تختار أكاديمية التعلم',
      'landing.teachers.title': 'تعرف على معلمينا الخبراء',
      
      // Languages Page
      'languages.title': 'اختر لغتك',
      'languages.subtitle': 'استكشف برامجنا اللغوية الشاملة التي يدرسها متحدثون أصليون ومعلمون خبراء.',
      'languages.cta': 'ابدأ التعلم اليوم',
      
      // Teachers Page
      'teachers.title': 'تعرف على معلمينا الخبراء',
      'teachers.subtitle': 'تعلم من معلمين معتمدين ومتحدثين أصليين متحمسين لمساعدتك على النجاح.',
      
      // Auth
      'auth.login.title': 'أهلاً بعودتك',
      'auth.register.title': 'إنشاء حساب',
      'auth.email': 'البريد الإلكتروني',
      'auth.password': 'كلمة المرور',
      'auth.name': 'الاسم الكامل',
      'auth.phone': 'رقم الهاتف',
      'auth.role': 'الدور',
      'auth.language': 'اللغة المفضلة',
    }
  },
  es: {
    translation: {
      // Navigation
      'nav.home': 'Inicio',
      'nav.languages': 'Idiomas',
      'nav.teachers': 'Profesores',
      'nav.about': 'Acerca de',
      'nav.contact': 'Contacto',
      'nav.login': 'Iniciar Sesión',
      'nav.register': 'Registrarse',
      'nav.dashboard': 'Panel',
      'nav.logout': 'Cerrar Sesión',
      
      // Common
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.confirm': 'Confirmar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.view': 'Ver',
      'common.submit': 'Enviar',
      'common.search': 'Buscar',
      'common.apiOffline': 'La API del backend no está disponible. Mostrando contenido de demostración para vista previa.',
      
      // Landing Page
      'landing.hero.title': 'Domina Nuevos Idiomas con Profesores Expertos',
      'landing.hero.subtitle': 'Únete a miles de estudiantes que aprenden idiomas a través de lecciones interactivas, sesiones en vivo y orientación personalizada de hablantes nativos.',
      'landing.hero.cta': 'Comenzar a Aprender Gratis',
      'landing.hero.demo': 'Ver Demo',
      'landing.features.title': 'Por Qué Elegir Learn Academy',
      'landing.teachers.title': 'Conoce a Nuestros Profesores Expertos',
      
      // Languages Page
      'languages.title': 'Elige Tu Idioma',
      'languages.subtitle': 'Explora nuestros programas de idiomas integrales impartidos por hablantes nativos e instructores expertos.',
      'languages.cta': 'Comenzar a Aprender Hoy',
      
      // Teachers Page
      'teachers.title': 'Conoce a Nuestros Profesores Expertos',
      'teachers.subtitle': 'Aprende de instructores certificados y hablantes nativos apasionados por ayudarte a tener éxito.',
      
      // Auth
      'auth.login.title': 'Bienvenido de Nuevo',
      'auth.register.title': 'Crear Cuenta',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.name': 'Nombre Completo',
      'auth.phone': 'Número de Teléfono',
      'auth.role': 'Rol',
      'auth.language': 'Idioma Preferido',
    }
  }
};

// RTL languages
export const RTL_LANGUAGES = ['ar'];

// Language configuration
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;