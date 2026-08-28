"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  buildPlanDays,
  resolveRutinaDay,
} from "@/features/alumna/lib/rutina-day";
import {
  buildProgresoByDateKey,
  mapRutinaProgresoRecord,
  type RutinaProgresoApiDoc,
} from "@/features/alumna/types/rutina-progreso";
import {
  mapLogPesoRecord,
  type LogPesoApiDoc,
  type LogPesoRecord,
} from "@/features/alumna/types/log-peso";
import { useAlumnaRutinaActiva } from "@/features/profe/hooks/useAlumnaRutinaActiva";
import {
  buildPesosBySlot,
  buildSeguimientoDays,
  buildSeguimientoStats,
  type SeguimientoDayView,
  type SeguimientoStats,
} from "@/features/profe/lib/seguimiento";

export function useAlumnaSeguimiento(alumnaId: string | undefined) {
  const {
    rutina,
    rutinaId,
    loading: rutinaLoading,
    error: rutinaError,
    refetch: refetchRutina,
  } = useAlumnaRutinaActiva(alumnaId);

  const [progresoByDateKey, setProgresoByDateKey] = useState<
    Record<string, ReturnType<typeof mapRutinaProgresoRecord>>
  >({});
  const [logs, setLogs] = useState<LogPesoRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const fetchSeguimientoData = useCallback(
    async (signal?: AbortSignal) => {
      if (!alumnaId || !rutinaId) {
        setProgresoByDateKey({});
        setLogs([]);
        setDataError(null);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      setDataError(null);

      try {
        const [progresoData, logsData] = await Promise.all([
          apiFetch<RutinaProgresoApiDoc[]>(
            `/api/rutina-progreso?alumnaId=${encodeURIComponent(alumnaId)}&rutinaId=${encodeURIComponent(rutinaId)}`,
            { signal },
          ),
          apiFetch<LogPesoApiDoc[]>(
            `/api/logs-pesos?alumnaId=${encodeURIComponent(alumnaId)}&rutinaId=${encodeURIComponent(rutinaId)}`,
            { signal },
          ),
        ]);

        setProgresoByDateKey(
          buildProgresoByDateKey(progresoData.map(mapRutinaProgresoRecord)),
        );
        setLogs(logsData.map(mapLogPesoRecord));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setDataError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el seguimiento",
        );
        setProgresoByDateKey({});
        setLogs([]);
      } finally {
        if (!signal?.aborted) setDataLoading(false);
      }
    },
    [alumnaId, rutinaId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchSeguimientoData(controller.signal);
    return () => controller.abort();
  }, [fetchSeguimientoData]);

  const dayInfo = useMemo(
    () => (rutina ? resolveRutinaDay(rutina) : null),
    [rutina],
  );

  const planDays = useMemo(() => {
    if (!rutina || !dayInfo) return [];
    return buildPlanDays(rutina, dayInfo);
  }, [dayInfo, rutina]);

  const dayViews = useMemo<SeguimientoDayView[]>(
    () => buildSeguimientoDays(planDays, progresoByDateKey),
    [planDays, progresoByDateKey],
  );

  const stats = useMemo<SeguimientoStats>(
    () => buildSeguimientoStats(dayViews),
    [dayViews],
  );

  const pesosBySlot = useMemo(() => buildPesosBySlot(logs), [logs]);

  const refetch = useCallback(() => {
    refetchRutina();
    void fetchSeguimientoData();
  }, [fetchSeguimientoData, refetchRutina]);

  return {
    rutina,
    rutinaId,
    dayViews,
    stats,
    pesosBySlot,
    loading: rutinaLoading || dataLoading,
    error: rutinaError ?? dataError,
    refetch,
  };
}
