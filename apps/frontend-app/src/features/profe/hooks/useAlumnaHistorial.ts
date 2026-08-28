"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  EMPTY_HISTORIAL_FILTERS,
  sortHistorialEvents,
  type AlumnaHistorialEvent,
  type AlumnaHistorialFilters,
} from "@/features/profe/types/historial";

function buildHistorialUrl(alumnaId: string, filters: AlumnaHistorialFilters) {
  const params = new URLSearchParams();
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.desde) params.set("desde", filters.desde);
  if (filters.hasta) params.set("hasta", filters.hasta);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  const query = params.toString();
  return `/api/usuarios/${encodeURIComponent(alumnaId)}/historial${
    query ? `?${query}` : ""
  }`;
}

export function useAlumnaHistorial(alumnaId: string | undefined) {
  const [events, setEvents] = useState<AlumnaHistorialEvent[]>([]);
  const [filters, setFilters] = useState<AlumnaHistorialFilters>(
    EMPTY_HISTORIAL_FILTERS,
  );
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(filters.q?.trim() ?? "");
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      q: debouncedQ || undefined,
    }),
    [filters, debouncedQ],
  );

  const fetchHistorial = useCallback(
    async (signal?: AbortSignal) => {
      if (!alumnaId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<AlumnaHistorialEvent[]>(
          buildHistorialUrl(alumnaId, effectiveFilters),
          { signal },
        );
        setEvents(sortHistorialEvents(Array.isArray(data) ? data : []));
      } catch (err) {
        if (signal?.aborted) return;
        setEvents([]);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el historial de la alumna",
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [alumnaId, effectiveFilters],
  );

  useEffect(() => {
    if (!alumnaId) {
      setEvents([]);
      return;
    }

    const controller = new AbortController();
    void fetchHistorial(controller.signal);
    return () => controller.abort();
  }, [alumnaId, fetchHistorial]);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_HISTORIAL_FILTERS);
  }, []);

  return {
    events,
    filters,
    setFilters,
    loading,
    error,
    refetch: () => void fetchHistorial(),
    clearFilters,
    hasActiveFilters: Boolean(
      filters.categoria ||
        filters.desde ||
        filters.hasta ||
        filters.q?.trim(),
    ),
  };
}
