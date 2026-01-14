import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import SchedulePage from "@/pages/SchedulePage";
import CoursesPage from "@/pages/CoursesPage";
import GradesPage from "@/pages/GradesPage";
import AIAdvisorPage from "@/pages/AIAdvisorPage";
import TransfersPage from "@/pages/TransfersPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import ProfilePage from "@/pages/ProfilePage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFound from "@/pages/NotFound";
import AdminAccountsPage from "@/pages/AdminAccountsPage";
import ManagerDashboardPage from "@/pages/ManagerDashboardPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Helper function to get default route based on role
function getDefaultRoute(roleName: string | undefined): string {
  switch (roleName) {
    case 'Admin':
      return '/admin/accounts';
    case 'Manager':
      return '/manager';
    default:
      return '/dashboard';
  }
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute(user?.roleName)} replace /> : <LoginPage />
        }
      />

      {/* Change Password Route */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/accounts"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AppLayout>
              <AdminAccountsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <AppLayout>
              <ManagerDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Student/Teacher Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SchedulePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CoursesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/grades"
        element={
          <ProtectedRoute>
            <AppLayout>
              <GradesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-advisor"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AIAdvisorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TransfersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Component to redirect based on user role
function RoleBasedRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={getDefaultRoute(user?.roleName)} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
