import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Clock, 
  KeyRound,
  CheckCircle2,
  LogOut,
  Camera,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, logout, updateAvatar } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file ảnh (.jpg, .png, .gif, .webp)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await updateAvatar(file);
      toast({
        title: 'Thành công',
        description: response.message,
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật avatar',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
            {/* Avatar with upload functionality */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />
            <div 
              className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer"
              onClick={handleAvatarClick}
            >
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://localhost:7280'}${user.avatarUrl}`}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
              )}
              {/* Upload overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Nhấp vào ảnh để thay đổi avatar
            </p>
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
