'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { handleSignOut } from '@/lib/auth';

export function useAuth() {
  const { token, userId, user, isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();

  const logout = async () => {
    try {
      await handleSignOut();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuth();
      router.push('/sign-in');
    }
  };

  return {
    token,
    userId,
    user,
    isAuthenticated: isAuthenticated(),
    logout,
  };
}
