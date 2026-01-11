import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types';
import { apiClient } from '@/lib/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await apiClient.login({ email, password });
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
