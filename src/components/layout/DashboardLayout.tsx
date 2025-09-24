import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './DashboardHeader'
import { BreadcrumbNav } from './BreadcrumbNav'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  userRole: 'student' | 'teacher' | 'admin'
  showBreadcrumbs?: boolean
  className?: string
}

export function DashboardLayout({ 
  children, 
  userRole, 
  showBreadcrumbs = true,
  className 
}: DashboardLayoutProps) {
  const isMobile = useIsMobile()

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Skip to main content link */}
        <a 
          href="#dashboard-main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        
        <Sidebar userRole={userRole} />
        
        <SidebarInset className="flex flex-col">
          <Header />
          
          <main 
            id="dashboard-main-content"
            className={cn(
              'flex-1 flex flex-col',
              isMobile ? 'p-4' : 'p-6',
              className
            )}
            role="main"
            aria-label={`${userRole} dashboard main content`}
          >
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
              {showBreadcrumbs && (
                <BreadcrumbNav className="mb-6" />
              )}
              
              <div className="flex-1">
                {children}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}