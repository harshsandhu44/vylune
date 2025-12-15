'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { trpcConfig } from '@/lib/api';
import { useTokenRefresh } from '@/hooks/use-token-refresh';
import { configureAmplify } from '@/lib/amplify';

function AuthProvider({ children }: { children: React.ReactNode }) {
  useTokenRefresh();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );
  const [trpcClient] = useState(() => trpc.createClient(trpcConfig));

  useEffect(() => {
    configureAmplify();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
