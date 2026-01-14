import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, RegisterRequest, ChangePasswordRequest, LoginResponse, RegisterResponse, ChangePasswordResponse } from '@/types';
import { apiClient } from '@/lib/api';

// ============ CHẾ ĐỘ TEST GIAO DIỆN ============
// Đặt thành `true` để bypass đăng nhập và test giao diện
// Đặt thành `false` khi backend đã sẵn sàng
const DEV_BYPASS_AUTH = false;

// User giả để test giao diện
const MOCK_USER: User = {
  userId: 1,
  email: 'student@university.edu.vn',
  fullName: 'Nguyễn Văn A',
  phoneNumber: '0912345678',
  roleName: 'Student',
  roleId: 4,
  isActive: true,
};

const MOCK_TOKEN = 'dev-mock-token-12345';
const MOCK_REFRESH_TOKEN = 'dev-mock-refresh-token-12345';
// ===============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Nếu DEV_BYPASS_AUTH = true, tự động đăng nhập
      user: DEV_BYPASS_AUTH ? MOCK_USER : null,
      token: DEV_BYPASS_AUTH ? MOCK_TOKEN : null,
      refreshToken: DEV_BYPASS_AUTH ? MOCK_REFRESH_TOKEN : null,
      isAuthenticated: DEV_BYPASS_AUTH ? true : false,
      mustChangePassword: false,

      login: async (email: string, password: string): Promise<LoginResponse> => {
        // Nếu đang ở chế độ test, bypass API call
        if (DEV_BYPASS_AUTH) {
          set({
            user: MOCK_USER,
            token: MOCK_TOKEN,
            refreshToken: MOCK_REFRESH_TOKEN,
            isAuthenticated: true,
            mustChangePassword: false,
          });
          return {
            token: MOCK_TOKEN,
            refreshToken: MOCK_REFRESH_TOKEN,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            user: MOCK_USER,
            mustChangePassword: false,
          };
        }

        const response = await apiClient.login({ email, password });
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        
        set({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          mustChangePassword: response.mustChangePassword,
        });

        return response;
      },

      loginWithGoogle: async (googleToken: string): Promise<LoginResponse> => {
        const response = await apiClient.googleLogin({ googleToken });
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        
        set({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          mustChangePassword: response.mustChangePassword,
        });

        return response;
      },

      register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await apiClient.register(data);
        return response;
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            mustChangePassword: false,
          });
        }
      },

      changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
        const response = await apiClient.changePassword(data);
        if (response.success) {
          set({ mustChangePassword: false });
        }
        return response;
      },

      refreshTokens: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await apiClient.refreshToken(currentRefreshToken);
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('refresh_token', response.refreshToken);
        
        set({
          token: response.token,
          refreshToken: response.refreshToken,
        });
      },

      setAuth: (user: User, token: string, refreshToken: string) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          mustChangePassword: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        mustChangePassword: state.mustChangePassword,
      }),
    }
  )
);
