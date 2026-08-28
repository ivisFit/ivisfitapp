"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { DevCacheReset } from "@/components/DevCacheReset";

function makeQueryClient() {
  const isDev = process.env.NODE_ENV === "development";

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: isDev ? 0 : 1000 * 60 * 5,
        gcTime: isDev ? 0 : 1000 * 60 * 30,
        retry: (failureCount, error) => {
          if (error instanceof Response && error.status === 401) return false;
          if (error instanceof Response && error.status === 403) return false;
          return failureCount < 3;
        },
        refetchOnWindowFocus: isDev,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <DevCacheReset />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}