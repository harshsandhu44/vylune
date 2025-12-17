'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useOrganizationStore } from '@/stores/organization.store';
import { useAuthStore } from '@/stores/auth.store';
import { trpc } from '@/lib/api';

interface OrganizationContextValue {
  isLoading: boolean;
  hasOrganization: boolean;
  needsOrganization: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue>({
  isLoading: true,
  hasOrganization: false,
  needsOrganization: true,
});

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { currentOrganization, setCurrentOrganization, setOrganizations } = useOrganizationStore();

  const { data: organizations, isLoading } = trpc.user.listUserOrganizations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && organizations) {
      setOrganizations(organizations);

      // Auto-select first organization if none is currently selected
      if (!currentOrganization && organizations.length > 0) {
        setCurrentOrganization(organizations[0], null);
      }
    }
  }, [organizations, isLoading, currentOrganization, setCurrentOrganization, setOrganizations]);

  return (
    <OrganizationContext.Provider
      value={{
        isLoading,
        hasOrganization: !!currentOrganization,
        needsOrganization: !currentOrganization && !isLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganizationContext = () => useContext(OrganizationContext);
