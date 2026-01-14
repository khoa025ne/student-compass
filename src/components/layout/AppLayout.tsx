import { ReactNode, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  Sparkles,
  ArrowRightLeft,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  User,
  Shield,
  Users,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

// Nav items for different roles
const studentNavItems = [
  { path: '/dashboard', label: 'Trang chủ', icon: LayoutDashboard },
  { path: '/schedule', label: 'Lịch học', icon: Calendar },
  { path: '/courses', label: 'Đăng ký môn', icon: BookOpen },
  { path: '/grades', label: 'Bảng điểm', icon: GraduationCap },
  { path: '/ai-advisor', label: 'Tư vấn AI', icon: Sparkles },
  { path: '/transfers', label: 'Chuyển lớp', icon: ArrowRightLeft },
  { path: '/notifications', label: 'Thông báo', icon: Bell },
];

const adminNavItems = [
  { path: '/admin/accounts', label: 'Quản lý tài khoản', icon: Shield },
];

const managerNavItems = [
  { path: '/manager', label: 'Quản lý học vụ', icon: GraduationCap },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      return false;
    }
    return false;
  });

  // Get nav items based on user role
  const navItems = useMemo(() => {
    switch (user?.roleName) {
      case 'Admin':
        return adminNavItems;
      case 'Manager':
        return managerNavItems;
      default:
        return studentNavItems;
    }
  }, [user?.roleName]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Floating background shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape w-96 h-96 -top-48 -left-48 animate-float-slow" />
        <div className="floating-shape w-64 h-64 top-1/3 right-0 animate-float" />
        <div className="floating-shape w-80 h-80 -bottom-40 left-1/4 animate-float-fast" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-card mx-4 mt-4 rounded-2xl">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl hidden sm:block">
                  Student Portal
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 gradient-bg-subtle rounded-xl"
                          transition={{ type: 'spring', duration: 0.5 }}
                        />
                      )}
                      <span className="relative flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Right side */}
              <div className="flex items-center gap-3">
                {/* Theme toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDark(!isDark)}
                  className="rounded-xl"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                {/* User info */}
                <Link to="/profile" className="hidden sm:flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground font-bold">
                    {user?.fullName?.split(' ').slice(-2).map(n => n[0]).join('')}
                  </div>
                </Link>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-xl text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>

                {/* Mobile menu toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden rounded-xl"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden glass-card mx-4 mt-2 rounded-2xl overflow-hidden"
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                        isActive
                          ? 'gradient-bg-subtle text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    location.pathname === '/profile'
                      ? 'gradient-bg-subtle text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Hồ sơ</span>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-28 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
