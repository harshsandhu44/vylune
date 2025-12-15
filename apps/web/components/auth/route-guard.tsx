'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const protectedRoutes = ['/', '/products', '/settings'];
const authRoutes = ['/sign-in', '/sign-up'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname?.startsWith(`${route}/`)
    );
    const isAuthRoute = authRoutes.includes(pathname || '');

    if (isProtectedRoute && !isAuthenticated) {
      router.push('/sign-in');
    } else if (isAuthRoute && isAuthenticated) {
      router.push('/');
    }
  }, [pathname, isAuthenticated, router]);

  return <>{children}</>;
}
