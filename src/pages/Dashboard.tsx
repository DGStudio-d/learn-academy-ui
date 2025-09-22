import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Redirect based on user role when component mounts
    if (user && isAuthenticated) {
      const roleRedirects = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard', 
        student: '/student/dashboard'
      }
      
      const redirectPath = roleRedirects[user.role as keyof typeof roleRedirects]
      if (redirectPath && window.location.pathname === '/dashboard') {
        window.location.replace(redirectPath)
      }
    }
  }, [user, isAuthenticated])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role-based redirection
  const roleRedirects = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard'
  }

  const redirectPath = roleRedirects[user.role as keyof typeof roleRedirects]
  
  if (redirectPath) {
    return <Navigate to={redirectPath} replace />
  }

  // Fallback for unknown roles
  return (
    <div className="container mx-auto py-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Learn Academy</h1>
        <p className="text-muted-foreground">
          Hello {user.name}! Your role: {user.role}
        </p>
        <p className="text-sm text-muted-foreground">
          Please contact support if you cannot access your dashboard.
        </p>
      </div>
    </div>
  )
}