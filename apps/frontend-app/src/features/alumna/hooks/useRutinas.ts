"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCached } from "@/lib/apiCache";
import type { RutinaSummary } from "../types/rutina";

type RutinaApiDoc = {
  _id?: string;
  id?: string;
  nombrePlan: string;
  duracionSemanas: number;
  startDate?: string;
  createdAt?: string;
};

function mapRutinaSummary(doc: RutinaApiDoc): RutinaSummary {
  return {
    id: doc._id ?? doc.id ?? "",
    nombrePlan: doc.nombrePlan,
    duracionSemanas: doc.duracionSemanas,
    startDate: doc.startDate,
    createdAt: doc.createdAt,
  };
}

export function useRutinas(alumnaId?: string | null) {
  const [rutinas, setRutinas] = useState<RutinaSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRutinas = useCallback(
    async (signal?: AbortSignal) => {
      if (!alumnaId) {
        setRutinas([]);
        setError(null);
        setLoading(false);
        return;
      }

      const cacheKey = `/api/rutinas?alumnaId=${alumnaId}`;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchCached<RutinaApiDoc[]>(
          cacheKey,
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
        setRutinas((data ?? []).map(mapRutinaSummary));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "No se pudo cargar la rutina");
        setRutinas([]);
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
    void fetchRutinas(controller.signal);
    return () => controller.abort();
  }, [fetchRutinas]);

  const refetch = useCallback(() => {
    void fetchRutinas();
  }, [fetchRutinas]);

  return { rutinas, loading, error, refetch };
}
