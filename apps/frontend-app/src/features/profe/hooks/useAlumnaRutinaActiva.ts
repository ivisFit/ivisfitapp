"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCached } from "@/lib/apiCache";
import { mapRutinaDetail } from "@/features/alumna/hooks/useRutinaDetail";
import { pickPrimaryRutina } from "@/features/alumna/lib/rutina-utils";
import type { RutinaDetail } from "@/features/alumna/types/rutina";

type RutinaSummaryApi = {
  _id?: string;
  id?: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useAlumnaRutinaActiva(alumnaId: string | undefined) {
  const [rutinaId, setRutinaId] = useState<string | null>(null);
  const [rutina, setRutina] = useState<RutinaDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutina = useCallback(
    async (id: string, signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const listCacheKey = `/api/rutinas?alumnaId=${id}`;
        const list = await fetchCached<RutinaSummaryApi[]>(
          listCacheKey,
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch<RutinaSummaryApi[]>(
                `/api/rutinas?alumnaId=${encodeURIComponent(id)}`,
                { signal: sig },
              ),
            ),
          30_000,
          signal,
        );

        if (list.length === 0) {
          setRutinaId(null);
          setRutina(null);
          setLoading(false);
          return;
        }

        const primary = pickPrimaryRutina(list);
        const resolvedId = primary?._id ?? primary?.id ?? "";
        if (!resolvedId) {
          setRutinaId(null);
          setRutina(null);
          setLoading(false);
          return;
        }

        const detailCacheKey = `/api/rutinas/${resolvedId}`;
        const detail = await fetchCached(
          detailCacheKey,
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch(`/api/rutinas/${resolvedId}`, { signal: sig }),
            ),
          30_000,
          signal,
        );
        setRutinaId(resolvedId);
        setRutina(mapRutinaDetail(detail as Parameters<typeof mapRutinaDetail>[0]));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar la rutina de la alumna",
        );
        setRutinaId(null);
        setRutina(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!alumnaId) {
      setRutinaId(null);
      setRutina(null);
      return;
    }

    const controller = new AbortController();
    void fetchRutina(alumnaId, controller.signal);
    return () => controller.abort();
  }, [alumnaId, fetchRutina]);

  const refetch = useCallback(() => {
    if (alumnaId) void fetchRutina(alumnaId);
  }, [alumnaId, fetchRutina]);

  return { rutinaId, rutina, loading, error, refetch, setRutinaId };
}
