"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getRutinaDayDateKey,
  useRutinaProgreso,
} from "@/features/alumna/hooks/useRutinaProgreso";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import type { RutinaDay } from "@/features/alumna/lib/rutina-day";
import type { RutinaProgresoRecord } from "@/features/alumna/types/rutina-progreso";

type MarkDayCompleteInput = {
  dateKey: string;
  numeroSemana: number;
  nombreDia: string;
  ejerciciosCompletados?: string[];
};

type DayCloseSnapshot = {
  ejerciciosCompletados: string[];
  diaCompletado: boolean;
  diaOmitido: boolean;
};

export type DayCloseUndo = {
  message: string;
  busy: boolean;
  error: string | null;
  restore: () => Promise<void>;
};

const UNDO_MS = 8000;

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
  const [dayCloseUndo, setDayCloseUndo] = useState<DayCloseUndo | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUndoTimer = useCallback(() => {
    if (!undoTimerRef.current) return;
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = null;
  }, []);

  useEffect(() => clearUndoTimer, [clearUndoTimer]);

  const armUndo = useCallback(
    (
      message: string,
      input: MarkDayCompleteInput,
      previous: RutinaProgresoRecord | undefined,
    ) => {
      if (!rutinaId) return;
      clearUndoTimer();
      const snapshot: DayCloseSnapshot | null = previous
        ? {
            ejerciciosCompletados: previous.ejerciciosCompletados,
            diaCompletado: previous.diaCompletado,
            diaOmitido: previous.diaOmitido,
          }
        : null;

      const restore = async () => {
        clearUndoTimer();
        setDayCloseUndo((current) =>
          current ? { ...current, busy: true, error: null } : current,
        );
        try {
          await upsertProgreso({
            rutinaId,
            dateKey: input.dateKey,
            numeroSemana: input.numeroSemana,
            nombreDia: input.nombreDia,
            ejerciciosCompletados: snapshot?.ejerciciosCompletados ?? [],
            diaCompletado: snapshot?.diaCompletado ?? false,
            diaOmitido: snapshot?.diaOmitido ?? false,
          });
          setDayCloseUndo(null);
        } catch (err) {
          setDayCloseUndo((current) =>
            current
              ? {
                  ...current,
                  busy: false,
                  error:
                    err instanceof Error
                      ? err.message
                      : "No se pudo deshacer",
                }
              : current,
          );
        }
      };

      setDayCloseUndo({ message, busy: false, error: null, restore });
      undoTimerRef.current = setTimeout(() => {
        undoTimerRef.current = null;
        setDayCloseUndo(null);
      }, UNDO_MS);
    },
    [clearUndoTimer, rutinaId, upsertProgreso],
  );

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
        diaOmitido: false,
      });
    },
    [getDayProgreso, rutinaId, upsertProgreso],
  );

  const markDayIncomplete = useCallback(
    async ({
      dateKey,
      numeroSemana,
      nombreDia,
      ejerciciosCompletados,
    }: MarkDayCompleteInput) => {
      if (!rutinaId) return;

      const existing = getDayProgreso(dateKey, numeroSemana, nombreDia);
      const input = { dateKey, numeroSemana, nombreDia };
      await upsertProgreso({
        rutinaId,
        dateKey,
        numeroSemana,
        nombreDia,
        ejerciciosCompletados:
          ejerciciosCompletados ?? existing?.ejerciciosCompletados ?? [],
        diaCompletado: false,
        diaOmitido: true,
      });
      armUndo(
        "Cerraste el día con ejercicios pendientes. No suma XP ni racha.",
        input,
        existing,
      );
    },
    [armUndo, getDayProgreso, rutinaId, upsertProgreso],
  );

  const markDaySkipped = useCallback(
    async ({
      dateKey,
      numeroSemana,
      nombreDia,
    }: MarkDayCompleteInput) => {
      if (!rutinaId) return;

      const existing = getDayProgreso(dateKey, numeroSemana, nombreDia);
      const input = { dateKey, numeroSemana, nombreDia };
      await upsertProgreso({
        rutinaId,
        dateKey,
        numeroSemana,
        nombreDia,
        ejerciciosCompletados: [],
        diaCompletado: false,
        diaOmitido: true,
      });
      armUndo(
        "Este día quedó como no hecho. No reemplaza el entrenamiento de hoy.",
        input,
        existing,
      );
    },
    [armUndo, getDayProgreso, rutinaId, upsertProgreso],
  );

  const isDayComplete = useCallback(
    (dateKey: string, numeroSemana?: number, nombreDia?: string) => {
      const record = getDayProgreso(dateKey, numeroSemana, nombreDia);
      if (record?.diaOmitido) return false;
      if (record?.diaCompletado) return true;
      return completedDateKeys.has(dateKey);
    },
    [completedDateKeys, getDayProgreso],
  );

  const isPlanDayDone = useCallback(
    (
      _dayNumber: number,
      dateKey: string,
      numeroSemana: number,
      nombreDia: string,
    ) => isDayComplete(dateKey, numeroSemana, nombreDia),
    [isDayComplete],
  );

  return {
    completedDateKeys,
    markDayComplete,
    markDayIncomplete,
    markDaySkipped,
    isDayComplete,
    isPlanDayDone,
    upsertProgreso,
    getDayProgreso,
    dayCloseUndo,
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
