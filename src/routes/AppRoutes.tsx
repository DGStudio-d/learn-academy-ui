import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

// Lazy load pages for better performance
const Login = lazy(() => import('../pages/auth/Login'))
const Register = lazy(() => import('../pages/auth/Register'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const GuestLanding = lazy(() => import('../pages/GuestLanding'))

// Student pages
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'))
const StudentPrograms = lazy(() => import('../pages/student/Programs'))
const StudentQuizzes = lazy(() => import('../pages/student/Quizzes'))
const StudentMeetings = lazy(() => import('../pages/student/Meetings'))
const StudentProfile = lazy(() => import('../pages/student/Profile'))

// Teacher pages  
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'))
const TeacherProfile = lazy(() => import('../pages/teacher/Profile'))
const TeacherQuizzes = lazy(() => import('../pages/teacher/Quizzes'))
const TeacherResults = lazy(() => import('../pages/teacher/Results'))
const TeacherMeetings = lazy(() => import('../pages/teacher/Meetings'))

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const AdminLanguages = lazy(() => import('../pages/admin/Languages'))
const AdminPrograms = lazy(() => import('../pages/admin/Programs'))
const AdminTeachers = lazy(() => import('../pages/admin/Teachers'))
const AdminSettings = lazy(() => import('../pages/admin/Settings'))
const AdminReports = lazy(() => import('../pages/admin/Reports'))

// Search pages
const AdvancedSearch = lazy(() => import('../pages/AdvancedSearch'))

// Demo pages
const FormDemo = lazy(() => import('../pages/FormDemo'))

// Page wrapper with error boundary and loading
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PageWrapper><GuestLanding /></PageWrapper>} />
      <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
      <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <PageWrapper><Dashboard /></PageWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Search routes */}
      <Route path="/search" element={
        <ProtectedRoute>
          <AppLayout>
            <PageWrapper><AdvancedSearch /></PageWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Demo routes */}
      <Route path="/demo/forms" element={
        <ProtectedRoute>
          <AppLayout>
            <PageWrapper><FormDemo /></PageWrapper>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<PageWrapper><StudentDashboard /></PageWrapper>} />
              <Route path="programs" element={<PageWrapper><StudentPrograms /></PageWrapper>} />
              <Route path="quizzes" element={<PageWrapper><StudentQuizzes /></PageWrapper>} />
              <Route path="meetings" element={<PageWrapper><StudentMeetings /></PageWrapper>} />
              <Route path="profile" element={<PageWrapper><StudentProfile /></PageWrapper>} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Teacher routes */}
      <Route path="/teacher/*" element={
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<PageWrapper><TeacherDashboard /></PageWrapper>} />
              <Route path="profile" element={<PageWrapper><TeacherProfile /></PageWrapper>} />
              <Route path="quizzes" element={<PageWrapper><TeacherQuizzes /></PageWrapper>} />
              <Route path="results" element={<PageWrapper><TeacherResults /></PageWrapper>} />
              <Route path="meetings" element={<PageWrapper><TeacherMeetings /></PageWrapper>} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
              <Route path="languages" element={<PageWrapper><AdminLanguages /></PageWrapper>} />
              <Route path="programs" element={<PageWrapper><AdminPrograms /></PageWrapper>} />
              <Route path="teachers" element={<PageWrapper><AdminTeachers /></PageWrapper>} />
              <Route path="settings" element={<PageWrapper><AdminSettings /></PageWrapper>} />
              <Route path="reports" element={<PageWrapper><AdminReports /></PageWrapper>} />
              <Route path="" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}