"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCached } from "@/lib/apiCache";
import { buildCargaSeriesByEjercicio } from "@/features/alumna/lib/progreso-charts";
import type { EjercicioCargaSeries } from "@/features/alumna/lib/progreso-charts";
import {
  mapLogPesoRecordWithNombre,
  type LogPesoApiDoc,
} from "@/features/alumna/types/log-peso";

type UseProgresoCargasParams = {
  rutinaId?: string | null;
  enabled?: boolean;
};

export function useProgresoCargas({
  rutinaId,
  enabled = true,
}: UseProgresoCargasParams) {
  const [series, setSeries] = useState<EjercicioCargaSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = Boolean(enabled && rutinaId);

  const fetchLogs = useCallback(
    async (signal?: AbortSignal) => {
      if (!canFetch || !rutinaId) {
        setSeries([]);
        setError(null);
        setLoading(false);
        return;
      }

      const cacheKey = `/api/logs-pesos?rutinaId=${rutinaId}`;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchCached<LogPesoApiDoc[]>(
          cacheKey,
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch<LogPesoApiDoc[]>(
                `/api/logs-pesos?rutinaId=${encodeURIComponent(rutinaId)}`,
                { signal: sig },
              ),
            ),
          10_000,
          signal,
        );
        const logs = (data ?? []).map(mapLogPesoRecordWithNombre);
        setSeries(buildCargaSeriesByEjercicio(logs));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los pesos registrados",
        );
        setSeries([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [canFetch, rutinaId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchLogs(controller.signal);
    return () => controller.abort();
  }, [fetchLogs]);

  const refetch = useCallback(() => {
    void fetchLogs();
  }, [fetchLogs]);

  return useMemo(
    () => ({
      series,
      loading,
      error,
      refetch,
      hasData: series.some((item) => item.puntos.length > 0),
    }),
    [error, loading, refetch, series],
  );
}
