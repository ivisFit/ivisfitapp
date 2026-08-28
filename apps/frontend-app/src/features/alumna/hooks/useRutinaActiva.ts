"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCached } from "@/lib/apiCache";
import { mapRutinaDetail } from "@/features/alumna/hooks/useRutinaDetail";
import { pickPrimaryRutina } from "@/features/alumna/lib/rutina-utils";
import type { RutinaDetail, RutinaSummary } from "@/features/alumna/types/rutina";

type RutinaApiDoc = {
  _id?: string;
  id?: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useRutinaActiva(alumnaId?: string | null) {
  const [rutina, setRutina] = useState<RutinaDetail | null>(null);
  const [rutinaSummary, setRutinaSummary] = useState<RutinaSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutinaActiva = useCallback(
    async (signal?: AbortSignal) => {
      if (!alumnaId) {
        setRutina(null);
        setRutinaSummary(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const listCacheKey = `/api/rutinas?alumnaId=${alumnaId}`;
        const list = await fetchCached<RutinaApiDoc[]>(
          listCacheKey,
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch<RutinaApiDoc[]>(
                `/api/rutinas?alumnaId=${encodeURIComponent(alumnaId)}`,
                { signal: sig },
              ),
            ),
          30_000,
          signal,
        );

        const primary = pickPrimaryRutina(list ?? []);
        if (!primary) {
          setRutina(null);
          setRutinaSummary(null);
          setLoading(false);
          return;
        }

        const resolvedId = primary._id ?? primary.id ?? "";
        setRutinaSummary({
          id: resolvedId,
          nombrePlan: primary.nombrePlan,
          duracionSemanas: primary.duracionSemanas,
          startDate: primary.startDate,
          createdAt: primary.createdAt,
          updatedAt: primary.updatedAt,
        });

        if (!resolvedId) {
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
        setRutina(mapRutinaDetail(detail as Parameters<typeof mapRutinaDetail>[0]));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la rutina");
        setRutina(null);
        setRutinaSummary(null);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [alumnaId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchRutinaActiva(controller.signal);
    return () => controller.abort();
  }, [fetchRutinaActiva]);

  const refetch = useCallback(() => {
    void fetchRutinaActiva();
  }, [fetchRutinaActiva]);

  return { rutina, rutinaSummary, loading, error, refetch };
}

export { pickPrimaryRutina as pickPrimaryFromList } from "@/features/alumna/lib/rutina-utils";
