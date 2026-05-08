"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { QUERY_CONFIG } from "@/lib/constants";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Lazy state init: QueryClient hanya dibuat 1x per mount.
  // Ref: vercel-react-best-practices/rerender-lazy-state-init
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_CONFIG.staleTime,
            gcTime: QUERY_CONFIG.gcTime,
            retry: QUERY_CONFIG.retry,
            refetchOnWindowFocus: QUERY_CONFIG.refetchOnWindowFocus,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
