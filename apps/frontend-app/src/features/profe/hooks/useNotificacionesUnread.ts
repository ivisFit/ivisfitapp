"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type UnreadResponse = { count: number };

const listeners = new Set<(count: number) => void>();
let unreadCount = 0;
let inflight: Promise<void> | null = null;

export function refreshNotificacionesUnread() {
  if (!inflight) {
    inflight = apiFetch<UnreadResponse>("/api/notificaciones/unread-count")
      .then((data) => {
        unreadCount = data.count;
        listeners.forEach((listener) => listener(unreadCount));
      })
      .catch(() => {
        // El badge se queda con el último conteo conocido.
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useNotificacionesUnread(enabled: boolean) {
  const [count, setCount] = useState(unreadCount);

  useEffect(() => {
    if (!enabled) return;

    const onCount = (next: number) => setCount(next);
    listeners.add(onCount);
    void refreshNotificacionesUnread();

    const onFocus = () => {
      if (document.visibilityState === "hidden") return;
      void refreshNotificacionesUnread();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      listeners.delete(onCount);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [enabled]);

  return enabled ? count : 0;
}
