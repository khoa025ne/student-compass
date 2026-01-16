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
  Settings,
  FolderKanban,
  CalendarRange,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/ui/notification-bell';
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
  { path: '/manager/semesters', label: 'Quản lý học kỳ', icon: CalendarRange },
  { path: '/manager/classes', label: 'Quản lý lớp học', icon: FolderKanban },
  { path: '/manager/students', label: 'Quản lý sinh viên', icon: Users },
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Fixed left */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col" style={{ background: 'hsl(var(--sidebar-background))' }}>
        {/* Logo/Brand */}
        <div className="p-6 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--sidebar-primary))' }}>
              <GraduationCap className="w-6 h-6" style={{ color: 'hsl(var(--sidebar-primary-foreground))' }} />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold" style={{ color: 'hsl(var(--sidebar-foreground))' }}>
                Student Compass
              </h1>
              <p className="text-xs" style={{ color: 'hsl(var(--sidebar-foreground) / 0.7)' }}>
                Quản lý học tập
              </p>
            </div>
          </Link>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'sidebar-nav-item flex items-center gap-3',
                  isActive && 'sidebar-nav-item-active'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Profile link */}
          <Link
            to="/profile"
            className={cn(
              'sidebar-nav-item flex items-center gap-3',
              location.pathname === '/profile' && 'sidebar-nav-item-active'
            )}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Hồ sơ</span>
          </Link>
        </nav>
        
        {/* User section */}
        <div className="p-4 border-t" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          {/* Notification bell for desktop */}
          <div className="flex items-center justify-between mb-4 px-3">
            <span className="text-sm" style={{ color: 'hsl(var(--sidebar-foreground) / 0.7)' }}>
              Thông báo
            </span>
            <NotificationBell />
          </div>
          
          {/* User info */}
          <div className="flex items-center gap-3 mb-4 px-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ 
                background: 'hsl(var(--sidebar-primary))',
                color: 'hsl(var(--sidebar-primary-foreground))'
              }}
            >
              {user?.fullName?.split(' ').slice(-2).map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--sidebar-foreground))' }}>
                {user?.fullName}
              </p>
              <p className="text-xs truncate" style={{ color: 'hsl(var(--sidebar-foreground) / 0.7)' }}>
                {user?.roleName}
              </p>
            </div>
          </div>
          
          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="sidebar-nav-item flex items-center gap-3 w-full"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{isDark ? 'Sáng' : 'Tối'}</span>
          </button>
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="sidebar-nav-item flex items-center gap-3 w-full mt-1"
            style={{ color: 'hsl(var(--destructive))' }}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng Xuất</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden glass-card mx-4 mt-4 rounded-xl">
          <div className="px-4 h-14 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">Student Compass</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="rounded-lg"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden glass-card mx-4 mt-2 rounded-xl overflow-hidden"
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
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                        isActive
                          ? 'bg-primary/10 text-primary'
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
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                    location.pathname === '/profile'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Hồ sơ</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
