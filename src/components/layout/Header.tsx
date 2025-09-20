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

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

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
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/languages" className="text-sm font-medium hover:text-primary transition-colors">
            Languages
          </Link>
          <Link to="/teachers" className="text-sm font-medium hover:text-primary transition-colors">
            Teachers
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        {/* Language Selector & Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Select value={currentLang} onValueChange={setCurrentLang}>
            <SelectTrigger className="w-[140px]">
              <Globe className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button className="btn-hero" asChild>
              <Link to="/register">Get Started</Link>
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
              to="/languages" 
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Languages
            </Link>
            <Link 
              to="/teachers" 
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Teachers
            </Link>
            <Link 
              to="/about" 
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              About
            </Link>
            <div className="flex space-x-2 pt-4">
              <Button variant="ghost" asChild className="flex-1">
                <Link to="/login">Login</Link>
              </Button>
              <Button className="btn-hero flex-1" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}