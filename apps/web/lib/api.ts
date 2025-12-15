import { httpBatchLink } from '@trpc/client';
import { useAuthStore } from '@/stores/auth.store';

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

export const trpcConfig = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        const token = useAuthStore.getState().token;

        return {
          ...(token && { Authorization: `Bearer ${token}` }),
        };
      },
    }),
  ],
};
