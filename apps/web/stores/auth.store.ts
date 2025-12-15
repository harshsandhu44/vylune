import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface PendingSignUp {
  email: string;
  password: string;
  name: string;
  cognitoId: string;
  timestamp: number;
}

interface AuthStore {
  token: string | null;
  userId: string | null;
  user: AuthUser | null;
  pendingSignUp: PendingSignUp | null;
  setAuth: (token: string, userId: string, user: AuthUser) => void;
  clearAuth: () => void;
  setPendingSignUp: (data: PendingSignUp | null) => void;
  clearPendingSignUp: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      user: null,
      pendingSignUp: null,
      setAuth: (token, userId, user) => set({ token, userId, user }),
      clearAuth: () => set({ token: null, userId: null, user: null }),
      setPendingSignUp: (data) => set({ pendingSignUp: data }),
      clearPendingSignUp: () => set({ pendingSignUp: null }),
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.userId;
      },
    }),
    { name: 'auth-storage' }
  )
);
