import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useAuth } from '../../contexts/AuthContext'
import { componentSpacing } from '../../utils/spacing'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: ReactNode
  showFooter?: boolean
  className?: string
}

export function AppLayout({ children, showFooter = true, className }: AppLayoutProps) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className={cn(
        'flex-1 container mx-auto px-4 sm:px-6 lg:px-8',
        'py-6 lg:py-8',
        className
      )}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  )
}