"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  clearDevBrowserCaches,
  setupDevCacheHotReload,
} from "@/lib/dev-cache-reset";

export function DevCacheReset() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    void clearDevBrowserCaches({ queryClient, clearStorage: true });
    return setupDevCacheHotReload(queryClient);
  }, [queryClient]);

  return null;
}
