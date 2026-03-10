'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // لا re-fetch عند التركيز - نستخدم polling يدوياً
            refetchOnWindowFocus: false,
            // البيانات صالحة لمدة 5 ثواني
            staleTime: 5000,
            // إعادة المحاولة مرة واحدة فقط
            retry: 1,
            // عدم re-fetch عند إعادة التركيب
            refetchOnMount: false,
            // Cache لمدة دقيقة
            gcTime: 60000,
          },
          mutations: {
            // إعادة المحاولة مرة واحدة
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
