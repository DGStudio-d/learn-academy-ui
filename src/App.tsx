import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AccessibilityProvider } from "./components/accessibility/AccessibilityProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RealTimeProvider } from "./components/common/RealTimeProvider";
import { ApiStatusBanner } from "./components/ui/ApiStatusBanner";
import { ToastNotificationSystem } from "./components/notifications/ToastNotificationSystem";
import { TouchNavigation } from "./components/layout/TouchNavigation";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { HelpProvider } from "./components/help/HelpContext";
import {
  CriticalErrorBoundary,
  ComponentErrorBoundary,
} from "./components/common/ErrorBoundary";
import { useGlobalErrorHandler } from "./hooks/useGlobalErrorHandler";
import { useRoutePreloader } from "./hooks/useRoutePreloader";
import { lazyWithPreload } from "./utils/codesplitting";
import { LoadingSkeleton } from "./components/performance/LoadingSkeleton";
import { PerformanceToggle } from "./components/performance/PerformanceDashboard";
import { SkipLink } from "./components/accessibility/KeyboardNavigation";
import { AccessibilityToolbar } from "./components/accessibility/AccessibilityToolbar";
import "./lib/i18n"; // Initialize i18n
import "./styles/accessibility.css"; // Import accessibility styles
import "./styles/help.css"; // Import help system styles

// Lazy load all major pages and components for better performance
const Landing = lazyWithPreload(() => import("./pages/Landing"));
const Login = lazyWithPreload(() => import("./pages/auth/Login"));
const Register = lazyWithPreload(() => import("./pages/auth/Register"));
const Languages = lazyWithPreload(() => import("./pages/Languages"));
const Teachers = lazyWithPreload(() => import("./pages/Teachers"));
const About = lazyWithPreload(() => import("./pages/About"));
const Contact = lazyWithPreload(() => import("./pages/Contact"));
const Programs = lazyWithPreload(() => import("./pages/Programs"));
const GuestQuizzes = lazyWithPreload(() => import("./pages/GuestQuizzes"));
const Profile = lazyWithPreload(() => import("./pages/Profile"));
const QuizAttempt = lazyWithPreload(() => import("./pages/QuizAttempt"));
const MeetingRoom = lazyWithPreload(() => import("./pages/MeetingRoom"));
const StudentDashboard = lazyWithPreload(
  () => import("./pages/dashboard/StudentDashboard")
);
const TeacherDashboard = lazyWithPreload(
  () => import("./pages/dashboard/TeacherDashboard")
);
const AdminDashboard = lazyWithPreload(
  () => import("./pages/dashboard/AdminDashboard")
);
const LanguageDemo = lazyWithPreload(() => import("./pages/LanguageDemo"));
const NotificationDemoPage = lazyWithPreload(
  () => import("./pages/NotificationDemo")
);
const HelpPage = lazyWithPreload(() => import("./pages/help/HelpPage"));
const NotFound = lazyWithPreload(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry authentication/authorization errors
        if ([401, 403, 404].includes(error?.response?.status)) {
          return false;
        }
        // Enhanced retry logic with exponential backoff
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry client errors except for specific cases
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return (
            error?.response?.status === 408 || error?.response?.status === 429
          );
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

const AppContent = () => {
  // Initialize global error handling
  useGlobalErrorHandler({
    enableConsoleLogging: true,
    enableToastNotifications: true,
    enableErrorReporting: process.env.NODE_ENV === "production",
    maxErrorsPerMinute: 10,
  });

  // Initialize route preloading
  useRoutePreloader();

  return (
    <>
        <Routes>
          {/* Public Routes with AppLayout */}
          <Route
            path="/"
            element={
              <ComponentErrorBoundary>
                <AppLayout>
                  <Suspense fallback={<LoadingSkeleton type="page" />}>
                    <Landing />
                  </Suspense>
                </AppLayout>
              </ComponentErrorBoundary>
            }
          />
          <Route
            path="/login"
            element={
              <ComponentErrorBoundary>
                <AppLayout showFooter={false}>
                  <Suspense fallback={<LoadingSkeleton type="auth" />}>
                    <Login />
                  </Suspense>
                </AppLayout>
              </ComponentErrorBoundary>
            }
          />
          <Route
            path="/register"
            element={
              <ComponentErrorBoundary>
                <AppLayout showFooter={false}>
                  <Suspense fallback={<LoadingSkeleton type="auth" />}>
                    <Register />
                  </Suspense>
                </AppLayout>
              </ComponentErrorBoundary>
            }
          />
          <Route
            path="/languages"
            element={
              <AppLayout showBreadcrumbs>
                <Suspense fallback={<LoadingSkeleton type="list" />}>
                  <Languages />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/teachers"
            element={
              <AppLayout showBreadcrumbs>
                <Suspense fallback={<LoadingSkeleton type="list" />}>
                  <Teachers />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/about"
            element={
              <AppLayout showBreadcrumbs>
                <Suspense fallback={<LoadingSkeleton type="page" />}>
                  <About />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <AppLayout showBreadcrumbs>
                <Suspense fallback={<LoadingSkeleton type="form" />}>
                  <Contact />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/programs"
            element={
              <AppLayout showBreadcrumbs>
                <Suspense fallback={<LoadingSkeleton type="list" />}>
                  <Programs />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/quizzes"
            element={
              <AppLayout showBreadcrumbs>
                <Suspense fallback={<LoadingSkeleton type="list" />}>
                  <GuestQuizzes />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/language-demo"
            element={
              <AppLayout>
                <Suspense fallback={<LoadingSkeleton type="page" />}>
                  <LanguageDemo />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/notification-demo"
            element={
              <AppLayout>
                <Suspense fallback={<LoadingSkeleton type="page" />}>
                  <NotificationDemoPage />
                </Suspense>
              </AppLayout>
            }
          />
          <Route
            path="/help"
            element={
              <AppLayout showBreadcrumbs>
                <Suspense fallback={<LoadingSkeleton type="page" />}>
                  <HelpPage />
                </Suspense>
              </AppLayout>
            }
          />

          {/* Role-specific help routes */}
          <Route
            path="/student/help"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout showRoleBasedNav showBreadcrumbs>
                  <Suspense fallback={<LoadingSkeleton type="page" />}>
                    <HelpPage />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/help"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <AppLayout showRoleBasedNav showBreadcrumbs>
                  <Suspense fallback={<LoadingSkeleton type="page" />}>
                    <HelpPage />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/help"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AppLayout showRoleBasedNav showBreadcrumbs>
                  <Suspense fallback={<LoadingSkeleton type="page" />}>
                    <HelpPage />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes with AppLayout */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
                <AppLayout showRoleBasedNav showBreadcrumbs>
                  <Suspense fallback={<LoadingSkeleton type="form" />}>
                    <Profile />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AppLayout showRoleBasedNav showBreadcrumbs showFooter={false}>
                  <Suspense fallback={<LoadingSkeleton type="quiz" />}>
                    <QuizAttempt />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meeting/:meetingId"
            element={
              <ProtectedRoute allowedRoles={["student", "teacher"]}>
                <AppLayout showRoleBasedNav showBreadcrumbs showFooter={false}>
                  <Suspense fallback={<LoadingSkeleton type="page" />}>
                    <MeetingRoom />
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Dashboards with DashboardLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ComponentErrorBoundary level="page">
                  <DashboardLayout userRole="student">
                    <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
                      <StudentDashboard />
                    </Suspense>
                  </DashboardLayout>
                </ComponentErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <ComponentErrorBoundary level="page">
                  <DashboardLayout userRole="teacher">
                    <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
                      <TeacherDashboard />
                    </Suspense>
                  </DashboardLayout>
                </ComponentErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ComponentErrorBoundary level="page">
                  <DashboardLayout userRole="admin">
                    <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
                      <AdminDashboard />
                    </Suspense>
                  </DashboardLayout>
                </ComponentErrorBoundary>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route
            path="*"
            element={
              <AppLayout>
                <Suspense fallback={<LoadingSkeleton type="page" />}>
                  <NotFound />
                </Suspense>
              </AppLayout>
            }
          />
        </Routes>

        {/* Touch Navigation for Mobile */}
        <TouchNavigation />
      
      </>
  );
};

const App = () => (
  <CriticalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <HelpProvider>
            <AppStateProvider>
              <NotificationProvider>
                <AccessibilityProvider>
                  <RealTimeProvider>
                    <TooltipProvider>
                      <ApiStatusBanner />
                      <ToastNotificationSystem />
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <SkipLink href="#main-content">
                          Skip to main content
                        </SkipLink>
                        <AppContent />
                      </BrowserRouter>
                      {/* Accessibility Toolbar */}
                      <AccessibilityToolbar position="bottom" />

                      {/* Performance monitoring in development */}
                      <PerformanceToggle />

                      {process.env.NODE_ENV === "development" && (
                        <ReactQueryDevtools initialIsOpen={false} />
                      )}
                    </TooltipProvider>
                  </RealTimeProvider>
                </AccessibilityProvider>
              </NotificationProvider>
            </AppStateProvider>
          </HelpProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </CriticalErrorBoundary>
);


export default App;
