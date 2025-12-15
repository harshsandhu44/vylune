'use client';

import { useEffect, useRef } from 'react';
import { refreshAuthToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';

const REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes (Cognito tokens expire in 1 hour)

export function useTokenRefresh() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  const userId = useAuthStore((state) => state.userId);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      const newToken = await refreshAuthToken();
      if (newToken && user && userId) {
        setAuth(newToken, userId, user);
      }
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, setAuth, user, userId]);
}
