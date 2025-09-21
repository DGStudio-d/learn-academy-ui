import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages, isRTL } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">LA</span>
          </div>
          <span className="text-xl font-bold text-gradient">Learn Academy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/languages" className="text-sm font-medium hover:text-primary transition-colors">
            {t('nav.languages')}
          </Link>
          <Link to="/teachers" className="text-sm font-medium hover:text-primary transition-colors">
            {t('nav.teachers')}
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
            {t('nav.about')}
          </Link>
        </nav>

        {/* Language Selector & Auth Buttons */}
        <div className="flex items-center gap-4">
          <Select value={currentLanguage} onValueChange={changeLanguage}>
            <SelectTrigger className="w-[140px]">
              <Globe className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">{t('nav.login')}</Link>
            </Button>
            <Button className="btn-hero" asChild>
              <Link to="/register">{t('nav.register')}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container py-4 space-y-3">
            <Link 
              to="/" 
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/languages" 
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              {t('nav.languages')}
            </Link>
            <Link 
              to="/teachers" 
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              {t('nav.teachers')}
            </Link>
            <Link 
              to="/about" 
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              {t('nav.about')}
            </Link>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" asChild className="flex-1">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button className="btn-hero flex-1" asChild>
                <Link to="/register">{t('nav.register')}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}