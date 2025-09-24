import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { BreadcrumbNav } from './BreadcrumbNav'
import { HelpSystem } from '../help/HelpSystem'
import { useAuth } from '../../contexts/AuthContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: ReactNode
  showFooter?: boolean
  showBreadcrumbs?: boolean
  showRoleBasedNav?: boolean
  className?: string
}

export function AppLayout({ 
  children, 
  showFooter = true, 
  showBreadcrumbs = false,
  showRoleBasedNav = false,
  className 
}: AppLayoutProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      
      {/* Navigation */}
      <Header showRoleBasedNav={showRoleBasedNav} />
      
      {/* Main Content */}
      <main 
        id="main-content"
        className={cn(
          'flex-1 container mx-auto',
          isMobile ? 'px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-6 lg:py-8',
          className
        )}
        role="main"
        aria-label="Main content"
      >
        <div className="max-w-7xl mx-auto">
          {showBreadcrumbs && (
            <BreadcrumbNav className="mb-6" />
          )}
          {children}
        </div>
      </main>
      
      {/* Footer */}
      {showFooter && <Footer />}
      
      {/* Global Help System */}
      <HelpSystem />
    </div>
  )
}