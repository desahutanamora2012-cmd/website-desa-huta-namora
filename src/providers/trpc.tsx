import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import superjson from "superjson";
import type { AppRouter } from "../../api/src/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection time
      // Hindari banjir request ketika auth gagal (403/UNAUTHORIZED)
      retry: (failureCount, error: any) => {
        const msg = String(error?.message ?? "");
        const code = String(error?.data?.code ?? "");
        const isAuthError =
          msg.toLowerCase().includes("unauth") ||
          msg.toLowerCase().includes("forbidden") ||
          code === "UNAUTHORIZED" ||
          code === "FORBIDDEN";
        return !isAuthError && failureCount < 1;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes fresh time
    },
    mutations: { retry: 0 },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      maxURLLength: 2083,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
      headers() {
        return {
          "Content-Type": "application/json",
        };
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
      >
        {children}
      </PersistQueryClientProvider>
    </trpc.Provider>
  );
}
