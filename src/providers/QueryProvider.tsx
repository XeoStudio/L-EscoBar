'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable refetch-on-focus; polling handles updates.
            refetchOnWindowFocus: false,
            // Data remains fresh for 5 seconds.
            staleTime: 5000,
            // Retry only once.
            retry: 1,
            // Disable refetch on remount.
            refetchOnMount: false,
            // Keep cache for one minute.
            gcTime: 60000,
          },
          mutations: {
            // Retry mutations once.
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
