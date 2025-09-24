import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, User, LogOut, Settings, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  showRoleBasedNav?: boolean;
}

export function Header({ className, showRoleBasedNav = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get role-based navigation items
  const getRoleBasedNavItems = () => {
    if (!isAuthenticated || !user || !showRoleBasedNav) return [];

    const baseItems = [
      { to: '/profile', label: t('nav.profile'), icon: User },
    ];

    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', label: t('nav.dashboard') },
          { to: '/admin/users', label: t('nav.users') },
          { to: '/admin/programs', label: t('nav.programs') },
          { to: '/admin/settings', label: t('nav.settings') },
          ...baseItems,
        ];
      case 'teacher':
        return [
          { to: '/teacher/dashboard', label: t('nav.dashboard') },
          { to: '/teacher/quizzes', label: t('nav.quizzes') },
          { to: '/teacher/meetings', label: t('nav.meetings') },
          { to: '/teacher/students', label: t('nav.students') },
          ...baseItems,
        ];
      case 'student':
        return [
          { to: '/dashboard', label: t('nav.dashboard') },
          { to: '/student/programs', label: t('nav.programs') },
          { to: '/student/quizzes', label: t('nav.quizzes') },
          { to: '/student/meetings', label: t('nav.meetings') },
          ...baseItems,
        ];
      default:
        return baseItems;
    }
  };

  // Public navigation items
  const publicNavItems = [
    { to: '/', label: t('nav.home') },
    { to: '/languages', label: t('nav.languages') },
    { to: '/teachers', label: t('nav.teachers') },
    { to: '/programs', label: 'Programs' },
    { to: '/quizzes', label: 'Quizzes' },
    { to: '/about', label: t('nav.about') },
  ];

  const navItems = isAuthenticated ? getRoleBasedNavItems() : publicNavItems;

  const renderDesktopNav = () => (
    <nav 
      className={cn(
        'hidden lg:flex items-center',
        isRTL ? 'rtl-gap-6' : 'gap-6'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1',
            location.pathname === item.to 
              ? 'text-primary font-semibold' 
              : 'text-muted-foreground'
          )}
          aria-current={location.pathname === item.to ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const renderMobileNav = () => (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isRTL ? 'right' : 'left'} 
        className="w-[300px] sm:w-[400px]"
        id="mobile-navigation"
      >
        <nav 
          className="flex flex-col space-y-4 mt-6"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.to
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon && <item.icon className="mr-3 h-4 w-4" />}
              {item.label}
            </Link>
          ))}
          
          {/* Search link for mobile - only show for authenticated users */}
          {isAuthenticated && (
            <Link
              to="/search"
              className={cn(
                'flex items-center py-3 px-4 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/search'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="mr-3 h-4 w-4" />
              {t('nav.search', 'Search')}
            </Link>
          )}
          
          {!isAuthenticated && (
            <div className="pt-4 space-y-3">
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.login')}
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.register')}
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  const renderUserMenu = () => {
    if (!isAuthenticated || !user) {
      return (
        <div className={cn(
          'hidden lg:flex items-center',
          isRTL ? 'rtl-gap-3' : 'gap-3'
        )}>
          <Button variant="ghost" asChild>
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button asChild>
            <Link to="/register">{t('nav.register')}</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className={cn(
        'flex items-center',
        isRTL ? 'rtl-gap-4' : 'gap-4'
      )}>
        {/* Notifications */}
        <NotificationCenter className="hidden sm:flex" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="p-2">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>{t('nav.profile')}</span>
              </Link>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link to="/admin/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('nav.settings')}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('nav.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-4">
          {isMobile && renderMobileNav()}
          <Link 
            to="/" 
            className="flex items-center space-x-3"
            aria-label="Learn Academy - Go to homepage"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <span className="text-lg font-bold text-primary-foreground" aria-hidden="true">LA</span>
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">
              Learn Academy
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {renderDesktopNav()}

        {/* Right Side Actions */}
        <div className={cn(
          'flex items-center',
          isRTL ? 'rtl-gap-4' : 'gap-4'
        )}>
          {/* Search Button - only show for authenticated users */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:flex"
              aria-label={t('nav.search', 'Search')}
            >
              <Link to="/search">
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{t('nav.search', 'Search')}</span>
              </Link>
            </Button>
          )}
          
          <LanguageSwitcher variant="compact" />
          {renderUserMenu()}
        </div>
      </div>
    </header>
  );
}