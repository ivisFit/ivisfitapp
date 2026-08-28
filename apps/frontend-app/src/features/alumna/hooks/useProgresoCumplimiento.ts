"use client";

import { useMemo } from "react";
import { useRutinaProgreso } from "@/features/alumna/hooks/useRutinaProgreso";
import { buildCumplimientoSummary } from "@/features/alumna/lib/progreso-charts";
import type { RutinaDetail } from "@/features/alumna/types/rutina";

type UseProgresoCumplimientoParams = {
  rutinaId?: string | null;
  rutina?: RutinaDetail | null;
  enabled?: boolean;
};

export function useProgresoCumplimiento({
  rutinaId,
  rutina,
  enabled = true,
}: UseProgresoCumplimientoParams) {
  const {
    progresoByDateKey,
    loading,
    error,
    refetch,
  } = useRutinaProgreso(enabled ? rutinaId : null, rutina);

  const summary = useMemo(
    () => buildCumplimientoSummary(progresoByDateKey, rutina),
    [progresoByDateKey, rutina],
  );

  const hasData = useMemo(
    () => summary.puntos.some((point) => point.porcentaje > 0),
    [summary.puntos],
  );

  return {
    summary,
    loading,
    error,
    refetch,
    hasData,
  };
}
