"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCached } from "@/lib/apiCache";
import { mapMedicionFromApi } from "@/lib/medicion-utils";
import {
  type Medicion,
  type MedicionApiDoc,
} from "@/features/profe/types/medicion";

export function useMisCircunferencias(enabled: boolean) {
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchMediciones = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setMediciones([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchCached<MedicionApiDoc[]>(
          "/api/mediciones",
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch<MedicionApiDoc[]>("/api/mediciones", { signal: sig }),
            ),
          15_000,
          signal,
        );
        const mapped = data
          .map(mapMedicionFromApi)
          .filter((medicion) => medicion.metodoCalculo === "us-navy")
          .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        setMediciones(mapped);
      } catch (err) {
        if (signal?.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las mediciones",
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchMediciones(controller.signal);
    return () => controller.abort();
  }, [fetchMediciones]);

  return {
    mediciones,
    loading,
    error,
    refetch: () => fetchMediciones(),
  };
}
