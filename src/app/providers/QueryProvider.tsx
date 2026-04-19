// TanStack Query Provider

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

const createClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(createClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
