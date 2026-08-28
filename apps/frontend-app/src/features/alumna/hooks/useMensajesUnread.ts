"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useMensajesUnread(enabled = true) {
  const { user } = useAuth();
  const isAlumna = enabled && user?.role === "alumna";
  const [count, setCount] = useState(0);

  const refetch = useCallback(async () => {
    if (!isAlumna) {
      setCount(0);
      return;
    }
    try {
      const data = await apiFetch<{ count: number }>("/api/mensajes/unread-count");
      setCount(typeof data.count === "number" ? data.count : 0);
    } catch {
      setCount(0);
    }
  }, [isAlumna]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { count, refetch };
}
