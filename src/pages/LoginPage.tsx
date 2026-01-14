import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Check, X } from 'lucide-react';
import '@/styles/animated-login.css';

// Google Client ID từ backend
const GOOGLE_CLIENT_ID = '1082045356078-s4lecgppqqc1inoruf9mmn5kg41e8lg1.apps.googleusercontent.com';

// Password validation rules (matching backend)
const passwordRules = [
  { id: 'length', label: 'Ít nhất 8 ký tự', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'Ít nhất 1 chữ hoa', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'Ít nhất 1 chữ thường', test: (p: string) => /[a-z]/.test(p) },
  { id: 'digit', label: 'Ít nhất 1 chữ số', test: (p: string) => /\d/.test(p) },
  { id: 'special', label: 'Ít nhất 1 ký tự đặc biệt (!@#$%^&*)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

function LoginForm() {
  const [isActive, setIsActive] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Change password state
  const [changePasswordEmail, setChangePasswordEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangePasswordLoading, setIsChangePasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login, loginWithGoogle, changePasswordByEmail } = useAuthStore();

  // Password validation status
  const passwordValidation = passwordRules.map(rule => ({
    ...rule,
    passed: rule.test(newPassword)
  }));
  const allPasswordRulesPassed = passwordValidation.every(r => r.passed);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  // Google Login handler
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Không nhận được thông tin từ Google');
      return;
    }
    
    setIsGoogleLoading(true);
    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      
      if (response.mustChangePassword) {
        toast.info('Vui lòng đổi mật khẩu lần đầu đăng nhập');
        setIsActive(true);
      } else {
        toast.success('Đăng nhập bằng Google thành công!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đăng nhập bằng Google thất bại');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);

    try {
      const response = await login(loginEmail, loginPassword);
      
      if (response.mustChangePassword) {
        toast.info('Vui lòng đổi mật khẩu lần đầu đăng nhập');
        setIsActive(true);
      } else {
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Change password handler (không cần đăng nhập)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!changePasswordEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }
    
    if (!allPasswordRulesPassed) {
      toast.error('Mật khẩu mới chưa đáp ứng đủ yêu cầu');
      return;
    }
    
    if (!passwordsMatch) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }
    
    setIsChangePasswordLoading(true);

    try {
      await changePasswordByEmail({
        email: changePasswordEmail,
        oldPassword,
        newPassword,
        confirmPassword
      });
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setIsActive(false);
      setLoginEmail(changePasswordEmail);
      // Reset form
      setChangePasswordEmail('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsChangePasswordLoading(false);
    }
  };

  return (
    <div className="animated-login-page">
      <div className={`wrapper ${isActive ? 'active' : ''}`}>
        <span className="rotate-bg"></span>
        <span className="rotate-bg2"></span>

        {/* Login Form */}
        <div className="form-box login">
          <h2 className="title animation" style={{ '--i': 0, '--j': 21 } as React.CSSProperties}>
            Đăng Nhập
          </h2>
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ '--i': 1, '--j': 22 } as React.CSSProperties}>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <label>Email</label>
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box animation" style={{ '--i': 2, '--j': 23 } as React.CSSProperties}>
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <label>Mật khẩu</label>
              <i 
                className={`bx ${showLoginPassword ? 'bxs-show' : 'bxs-hide'}`}
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>

            <button 
              type="submit" 
              className="btn animation" 
              style={{ '--i': 3, '--j': 24 } as React.CSSProperties}
              disabled={isLoginLoading}
            >
              {isLoginLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>

            {/* Google Login */}
            <div className="google-login animation" style={{ '--i': 4, '--j': 25 } as React.CSSProperties}>
              <div className="divider">
                <span>Hoặc</span>
              </div>
              {isGoogleLoading ? (
                <div className="google-loading">
                  <span>Đang đăng nhập với Google...</span>
                </div>
              ) : (
                <div className="google-btn-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="280"
                  />
                </div>
              )}
            </div>

            <div className="linkTxt animation" style={{ '--i': 5, '--j': 26 } as React.CSSProperties}>
              <p>Quên mật khẩu? <a href="#" className="register-link" onClick={(e) => {
                e.preventDefault();
                setIsActive(true);
              }}>Đổi mật khẩu</a></p>
            </div>
          </form>
        </div>

        <div className="info-text login">
          <h2 className="animation" style={{ '--i': 0, '--j': 20 } as React.CSSProperties}>
            Chào Mừng!
          </h2>
          <p className="animation" style={{ '--i': 1, '--j': 21 } as React.CSSProperties}>
            Hệ thống quản lý sinh viên thông minh
          </p>
        </div>

        {/* Change Password Form */}
        <div className="form-box register">
          <h2 className="title animation" style={{ '--i': 17, '--j': 0 } as React.CSSProperties}>
            Đổi Mật Khẩu
          </h2>

          <form onSubmit={handleChangePassword}>
            <div className="input-box animation" style={{ '--i': 18, '--j': 1 } as React.CSSProperties}>
              <input
                type="email"
                required
                value={changePasswordEmail}
                onChange={(e) => setChangePasswordEmail(e.target.value)}
              />
              <label>Email</label>
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box animation" style={{ '--i': 19, '--j': 2 } as React.CSSProperties}>
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <label>Mật khẩu cũ</label>
              <i 
                className={`bx ${showOldPassword ? 'bxs-show' : 'bxs-hide'}`}
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>

            <div className="input-box animation" style={{ '--i': 20, '--j': 3 } as React.CSSProperties}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={newPassword ? (allPasswordRulesPassed ? 'valid-password' : 'invalid-password') : ''}
              />
              <label>Mật khẩu mới</label>
              <i 
                className={`bx ${showNewPassword ? 'bxs-show' : 'bxs-hide'}`}
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>

            {/* Password Rules Checklist */}
            {newPassword && (
              <div className="password-rules animation" style={{ '--i': 19, '--j': 2 } as React.CSSProperties}>
                {passwordValidation.map((rule) => (
                  <div key={rule.id} className={`rule ${rule.passed ? 'passed' : 'failed'}`}>
                    {rule.passed ? <Check size={12} /> : <X size={12} />}
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="input-box animation" style={{ '--i': 20, '--j': 3 } as React.CSSProperties}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={confirmPassword ? (passwordsMatch ? 'valid-password' : 'invalid-password') : ''}
              />
              <label>Xác nhận mật khẩu</label>
              <i 
                className={`bx ${showConfirmPassword ? 'bxs-show' : 'bxs-hide'}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ cursor: 'pointer' }}
              ></i>
            </div>

            {confirmPassword && !passwordsMatch && (
              <p className="error-text animation" style={{ '--i': 20, '--j': 3 } as React.CSSProperties}>
                Mật khẩu xác nhận không khớp
              </p>
            )}

            <button 
              type="submit" 
              className="btn animation" 
              style={{ '--i': 21, '--j': 4 } as React.CSSProperties}
              disabled={isChangePasswordLoading || !allPasswordRulesPassed || !passwordsMatch}
            >
              {isChangePasswordLoading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
            </button>

            <div className="linkTxt animation" style={{ '--i': 22, '--j': 5 } as React.CSSProperties}>
              <p><a href="#" className="login-link" onClick={(e) => {
                e.preventDefault();
                setIsActive(false);
              }}>← Quay lại đăng nhập</a></p>
            </div>
          </form>
        </div>

        <div className="info-text register">
          <h2 className="animation" style={{ '--i': 17, '--j': 0 } as React.CSSProperties}>
            Bảo Mật
          </h2>
          <p className="animation" style={{ '--i': 18, '--j': 1 } as React.CSSProperties}>
            Đổi mật khẩu để bảo vệ tài khoản của bạn
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrap với GoogleOAuthProvider
export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
