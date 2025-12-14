import { httpBatchLink } from '@trpc/client';

export function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

export const trpcConfig = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        return {
          // Add auth headers from cookies/session
        };
      },
    }),
  ],
};
