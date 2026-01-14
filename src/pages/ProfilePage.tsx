import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Clock, 
  KeyRound,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return 'destructive';
      case 'Manager':
        return 'warning';
      case 'Teacher':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text">
          Hồ sơ cá nhân
        </h1>
        <p className="text-muted-foreground">
          Quản lý thông tin tài khoản của bạn
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <GlassCard className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full gradient-bg flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold">{user.fullName}</h2>
            <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
            <StatusBadge variant={getRoleBadgeVariant(user.roleName) as 'default' | 'destructive' | 'secondary'}>
              {user.roleName}
            </StatusBadge>
            
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/change-password')}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </>
                )}
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <GlassCard>
            <h3 className="font-display font-bold text-lg mb-6">Thông tin tài khoản</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{user.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vai trò</p>
                  <p className="font-medium">{user.roleName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trạng thái</p>
                  <p className={cn('font-medium', user.isActive ? 'text-success' : 'text-destructive')}>
                    {user.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </p>
                </div>
              </div>

              {user.createdAt && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày tạo</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}

              {user.lastLogin && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Đăng nhập lần cuối</p>
                    <p className="font-medium">
                      {new Date(user.lastLogin).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Security Settings */}
          <GlassCard>
            <h3 className="font-display font-bold text-lg mb-6">Bảo mật</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Mật khẩu</p>
                    <p className="text-xs text-muted-foreground">
                      Đổi mật khẩu để bảo vệ tài khoản
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/change-password')}>
                  Thay đổi
                </Button>
              </div>

              {user.hasGoogleAccount && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <p className="text-sm text-success">
                    Tài khoản đã liên kết với Google
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
