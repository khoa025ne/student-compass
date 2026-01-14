import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';
import { GlassCard } from '@/components/ui/glass-card';
import { Lock, KeyRound, CheckCircle2, X, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Password validation rules matching backend PasswordValidator
interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecialChar: boolean;
}

const validatePassword = (password: string): PasswordValidation => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

const isPasswordValid = (validation: PasswordValidation): boolean => {
  return Object.values(validation).every(Boolean);
};

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { changePassword, mustChangePassword, logout } = useAuthStore();

  // Validate password in real-time
  const passwordValidation = useMemo(() => validatePassword(newPassword), [newPassword]);
  const allValid = useMemo(() => isPasswordValid(passwordValidation), [passwordValidation]);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isDifferentFromOld = newPassword !== oldPassword || newPassword.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allValid) {
      toast.error('Mật khẩu mới chưa đạt yêu cầu bảo mật');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword === oldPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu cũ');
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      
      if (response.success) {
        toast.success('Đổi mật khẩu thành công!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation indicator component
  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={cn(
      "flex items-center gap-2 text-sm transition-colors",
      isValid ? "text-green-500" : "text-muted-foreground"
    )}>
      {isValid ? (
        <Check className="w-4 h-4" />
      ) : (
        <X className="w-4 h-4" />
      )}
      <span>{text}</span>
    </div>
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-bg flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold gradient-text">
              Đổi mật khẩu
            </h1>
            {mustChangePassword && (
              <p className="text-muted-foreground mt-2 text-sm">
                Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng hệ thống
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="old-password">Mật khẩu hiện tại</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="old-password"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 h-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={cn(
                    "pl-12 pr-12 h-12 rounded-xl transition-colors",
                    newPassword.length > 0 && (allValid ? "border-green-500 focus-visible:ring-green-500" : "border-orange-400 focus-visible:ring-orange-400")
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password validation checklist */}
              {newPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 rounded-lg bg-muted/50 space-y-1.5"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">Yêu cầu mật khẩu:</p>
                  <ValidationItem isValid={passwordValidation.minLength} text="Ít nhất 8 ký tự" />
                  <ValidationItem isValid={passwordValidation.hasUppercase} text="Có ít nhất 1 chữ hoa (A-Z)" />
                  <ValidationItem isValid={passwordValidation.hasLowercase} text="Có ít nhất 1 chữ thường (a-z)" />
                  <ValidationItem isValid={passwordValidation.hasDigit} text="Có ít nhất 1 chữ số (0-9)" />
                  <ValidationItem isValid={passwordValidation.hasSpecialChar} text="Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)" />
                  {oldPassword.length > 0 && newPassword.length > 0 && (
                    <ValidationItem isValid={isDifferentFromOld} text="Khác mật khẩu cũ" />
                  )}
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={cn(
                    "pl-12 pr-12 h-12 rounded-xl transition-colors",
                    confirmPassword.length > 0 && (passwordsMatch ? "border-green-500 focus-visible:ring-green-500" : "border-red-500 focus-visible:ring-red-500")
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> Mật khẩu xác nhận không khớp
                </p>
              )}
              {confirmPassword.length > 0 && passwordsMatch && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mật khẩu xác nhận khớp
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {!mustChangePassword && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Hủy
                </Button>
              )}
              {mustChangePassword && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                  className="flex-1 h-12 rounded-xl"
                >
                  Đăng xuất
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || !allValid || !passwordsMatch || !isDifferentFromOld || !oldPassword}
                className="flex-1 h-12 rounded-xl gradient-bg text-primary-foreground disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Xác nhận
                  </>
                )}
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
