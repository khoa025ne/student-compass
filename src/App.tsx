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
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected routes */}
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

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
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
