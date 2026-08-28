"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCached } from "@/lib/apiCache";
import {
  buildLogsByEjercicioId,
  mapLogPesoRecord,
  type LogPesoApiDoc,
} from "../types/log-peso";

type UseLogsPesosParams = {
  rutinaId?: string | null | undefined;
  semana?: number | undefined;
  dia?: string | undefined;
  enabled?: boolean | undefined;
};

function buildQuery(params: {
  rutinaId: string;
  semana: number;
  dia: string;
}): string {
  const search = new URLSearchParams({
    rutinaId: params.rutinaId,
    semana: String(params.semana),
    dia: params.dia,
  });
  return `/api/logs-pesos?${search.toString()}`;
}

export function useLogsPesos({
  rutinaId,
  semana,
  dia,
  enabled = true,
}: UseLogsPesosParams) {
  const [logsByEjercicioId, setLogsByEjercicioId] = useState<
    Record<string, number[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = Boolean(
    enabled && rutinaId && semana && semana > 0 && dia?.trim(),
  );

  const fetchLogs = useCallback(
    async (signal?: AbortSignal) => {
      if (!canFetch || !rutinaId || !semana || !dia) {
        setLogsByEjercicioId({});
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const query = buildQuery({ rutinaId, semana, dia });
        const data = await fetchCached<LogPesoApiDoc[]>(
          query,
          (sig) =>
            import("@/lib/api").then(({ apiFetch }) =>
              apiFetch<LogPesoApiDoc[]>(query, { signal: sig }),
            ),
          10_000,
          signal,
        );
        const records = data.map(mapLogPesoRecord);
        setLogsByEjercicioId(buildLogsByEjercicioId(records));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los pesos",
        );
        setLogsByEjercicioId({});
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [canFetch, dia, rutinaId, semana],
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
      logsByEjercicioId,
      loading,
      error,
      refetch,
    }),
    [error, loading, logsByEjercicioId, refetch],
  );
}

export function useHistoricoPesos({
  rutinaId,
  semana,
  dia,
  enabled = true,
}: UseLogsPesosParams) {
  const semanaAnterior = semana && semana > 1 ? semana - 1 : undefined;

  return useLogsPesos({
    rutinaId,
    semana: semanaAnterior,
    dia,
    enabled: enabled && Boolean(semanaAnterior),
  });
}
