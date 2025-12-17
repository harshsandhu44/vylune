'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useOrganizationStore } from '@/stores/organization.store';
import { trpc } from '@/lib/trpc';

const protectedRoutes = ['/', '/products', '/settings'];
const authRoutes = ['/sign-in', '/sign-up'];
const onboardingRoute = '/onboarding';
const billingRoute = '/settings/organization';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { currentOrganization, canAccessApp } = useOrganizationStore();

  const { data: organizations, isLoading } = trpc.user.listUserOrganizations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isLoading) return;

    const isProtectedRoute = protectedRoutes.some(
      (route) => pathname === route || pathname?.startsWith(`${route}/`)
    );
    const isAuthRoute = authRoutes.includes(pathname || '');
    const isOnboarding = pathname === onboardingRoute;
    const isBilling = pathname?.startsWith(billingRoute);

    // Not authenticated -> sign in
    if (isProtectedRoute && !isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    // Authenticated but no organization -> onboarding
    if (
      isAuthenticated &&
      !isOnboarding &&
      (!organizations || organizations.length === 0) &&
      !isAuthRoute
    ) {
      router.push(onboardingRoute);
      return;
    }

    // Has organization but trial/subscription expired -> billing
    if (
      isProtectedRoute &&
      currentOrganization &&
      !canAccessApp() &&
      !isBilling &&
      !isOnboarding
    ) {
      router.push(`${billingRoute}?tab=billing`);
      return;
    }

    // Already authenticated and has org -> dashboard
    if (isAuthRoute && isAuthenticated && organizations && organizations.length > 0) {
      router.push('/');
      return;
    }
  }, [pathname, isAuthenticated, organizations, isLoading, currentOrganization, canAccessApp, router]);

  return <>{children}</>;
}
