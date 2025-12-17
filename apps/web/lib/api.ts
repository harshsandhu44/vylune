import { httpBatchLink } from '@trpc/client';
import { useAuthStore } from '@/stores/auth.store';
import { useOrganizationStore } from '@/stores/organization.store';

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

export const trpcConfig = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        const token = useAuthStore.getState().token;
        const organizationId = useOrganizationStore.getState().currentOrganization?.id;

        return {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(organizationId && { 'x-organization-id': organizationId }),
        };
      },
    }),
  ],
};
