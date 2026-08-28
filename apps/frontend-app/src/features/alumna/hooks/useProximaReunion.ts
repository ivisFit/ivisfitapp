"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  isReunionToday,
  mapReunionFromApi,
  type Reunion,
} from "@/features/profe/types/reunion";

type ReunionApiDoc = Parameters<typeof mapReunionFromApi>[0];

export function useProximaReunion(enabled = true) {
  const [reunion, setReunion] = useState<Reunion | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchReunion = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ReunionApiDoc | null>("/api/reuniones/proxima", {
        signal,
      });

      if (requestId !== requestIdRef.current) return;

      setReunion(data ? mapReunionFromApi(data) : null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la próxima reunión",
      );
      setReunion(null);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      setReunion(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchReunion(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchReunion]);

  const refetch = useCallback(() => {
    void fetchReunion();
  }, [fetchReunion]);

  return {
    reunion,
    esHoy: reunion ? isReunionToday(reunion.fecha) : false,
    loading,
    error,
    refetch,
  };
}
