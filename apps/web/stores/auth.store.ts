import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  token: string | null;
  userId: string | null;
  user: AuthUser | null;
  setAuth: (token: string, userId: string, user: AuthUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      user: null,
      setAuth: (token, userId, user) => set({ token, userId, user }),
      clearAuth: () => set({ token: null, userId: null, user: null }),
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.userId;
      },
    }),
    { name: 'auth-storage' }
  )
);
