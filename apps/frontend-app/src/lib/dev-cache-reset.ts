"use client";

import type { QueryClient } from "@tanstack/react-query";
import { apiCacheStore } from "@/lib/apiCache";
import { isDevInstallServiceWorker } from "@/lib/pwa-install";

const DEV_PRELOAD_CACHE_KEY = "ivis:transition-preload-cache";

type ClearDevCachesOptions = {
  queryClient?: QueryClient;
  clearStorage?: boolean;
};

export function clearInMemoryDevCaches(queryClient?: QueryClient) {
  apiCacheStore.setState({
    cache: new Map(),
    inflight: new Map(),
  });
  queryClient?.clear();
}

export async function clearDevBrowserCaches(
  options: ClearDevCachesOptions = {},
) {
  if (process.env.NODE_ENV !== "development") return;

  clearInMemoryDevCaches(options.queryClient);

  if (options.clearStorage && typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(DEV_PRELOAD_CACHE_KEY);
    } catch {
      // Storage may be unavailable in private mode.
    }
  }

  if (typeof window === "undefined") return;

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) =>
        isDevInstallServiceWorker(registration)
          ? Promise.resolve(false)
          : registration.unregister(),
      ),
    );
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export function setupDevCacheHotReload(queryClient?: QueryClient) {
  if (process.env.NODE_ENV !== "development") {
    return () => {};
  }

  // Webpack HMR only; Turbopack does not expose `module` in the browser bundle.
  if (typeof module === "undefined") {
    return () => {};
  }

  const moduleWithHot = module as NodeModule & {
    hot?: {
      addStatusHandler: (handler: (status: string) => void) => void;
      removeStatusHandler?: (handler: (status: string) => void) => void;
    };
  };

  const hot = moduleWithHot.hot;
  if (!hot) {
    return () => {};
  }

  const onStatus = (status: string) => {
    if (status === "idle") {
      clearInMemoryDevCaches(queryClient);
    }
  };

  hot.addStatusHandler(onStatus);

  return () => {
    hot.removeStatusHandler?.(onStatus);
  };
}
