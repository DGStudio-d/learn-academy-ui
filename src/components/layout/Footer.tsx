import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer({ isRTL = false }: { isRTL?: boolean }) {
  return (
    <footer className="bg-slate-50 border-t border-border/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-lg font-bold text-primary-foreground">LA</span>
              </div>
              <span className="text-xl font-bold text-gradient">Learn Academy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering global communication through innovative language learning experiences.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="space-y-2">
              <Link to="/languages" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Languages
              </Link>
              <Link to="/teachers" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Teachers
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Learning */}
          <div className="space-y-4">
            <h4 className="font-semibold">Learning</h4>
            <nav className="space-y-2">
              <Link to="/programs" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Programs
              </Link>
              <Link to="/quizzes" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Practice Quizzes
              </Link>
              <Link to="/meetings" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Live Sessions
              </Link>
              <Link to="/resources" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Resources
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@learnacademy.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Learning St, Education City</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Learn Academy. All rights reserved.
          </p>
          <div className={`flex ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'} mt-4 md:mt-0`}>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
