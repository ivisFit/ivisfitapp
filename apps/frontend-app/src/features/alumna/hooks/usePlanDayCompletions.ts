"use client";

import { useCallback } from "react";
import {
  getRutinaDayDateKey,
  useRutinaProgreso,
} from "@/features/alumna/hooks/useRutinaProgreso";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import type { RutinaDay } from "@/features/alumna/lib/rutina-day";

type MarkDayCompleteInput = {
  dateKey: string;
  numeroSemana: number;
  nombreDia: string;
  ejerciciosCompletados?: string[];
};

export function usePlanDayCompletions(
  rutinaId: string | null | undefined,
  rutina?: RutinaDetail | null,
) {
  const {
    completedDateKeys,
    upsertProgreso,
    getDayProgreso,
    loading,
    error,
    refetch,
  } = useRutinaProgreso(rutinaId, rutina);

  const markDayComplete = useCallback(
    async ({
      dateKey,
      numeroSemana,
      nombreDia,
      ejerciciosCompletados,
    }: MarkDayCompleteInput) => {
      if (!rutinaId) return;

      const existing = getDayProgreso(dateKey, numeroSemana, nombreDia);
      await upsertProgreso({
        rutinaId,
        dateKey,
        numeroSemana,
        nombreDia,
        ejerciciosCompletados:
          ejerciciosCompletados ?? existing?.ejerciciosCompletados ?? [],
        diaCompletado: true,
      });
    },
    [getDayProgreso, rutinaId, upsertProgreso],
  );

  const isDayComplete = useCallback(
    (dateKey: string, numeroSemana?: number, nombreDia?: string) => {
      if (completedDateKeys.has(dateKey)) return true;
      return Boolean(
        getDayProgreso(dateKey, numeroSemana, nombreDia)?.diaCompletado,
      );
    },
    [completedDateKeys, getDayProgreso],
  );

  return {
    completedDateKeys,
    markDayComplete,
    isDayComplete,
    upsertProgreso,
    getDayProgreso,
    loading,
    error,
    refetch,
  };
}

export function buildTodayCompletionInput(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): MarkDayCompleteInput {
  return {
    dateKey: getRutinaDayDateKey(rutina, dayInfo),
    numeroSemana: dayInfo.numeroSemana,
    nombreDia: dayInfo.nombreDia,
    ejerciciosCompletados: dayInfo.ejercicios
      .map((ejercicio) => ejercicio.id)
      .filter(Boolean),
  };
}
