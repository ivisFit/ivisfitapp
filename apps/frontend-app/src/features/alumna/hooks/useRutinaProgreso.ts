"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { fetchCached, invalidateCache } from "@/lib/apiCache";
import { useInvalidateGamificacion } from "@/features/gamificacion/hooks/useGamificacion";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import {
  getDateKeyForPlanDayIndex,
  getFlatRoutineDays,
  type ChallengeDay,
} from "@/features/alumna/lib/rutina-day";
import {
  getRutinaDayDateKey,
  readCompletedDayKeys,
  readExerciseHistory,
} from "@/features/alumna/lib/rutina-day-progress";
import {
  buildProgresoByDateKey,
  mapRutinaProgresoRecord,
  type RutinaProgresoApiDoc,
  type RutinaProgresoRecord,
  type UpsertRutinaProgresoPayload,
} from "@/features/alumna/types/rutina-progreso";

function normalizeExerciseIds(
  keys: string[],
  ejercicioIds: string[],
): string[] {
  const normalized = keys
    .map((key) => {
      if (ejercicioIds.includes(key)) return key;
      const match = key.match(/^(.+)-\d+$/);
      if (match && ejercicioIds.includes(match[1])) return match[1];
      return null;
    })
    .filter((value): value is string => Boolean(value));

  return [...new Set(normalized)];
}

function buildDateKeyMap(rutina: RutinaDetail): Map<string, { numeroSemana: number; nombreDia: string; ejercicioIds: string[] }> {
  const startKey =
    rutina.startDate?.slice(0, 10) ??
    rutina.createdAt?.slice(0, 10) ??
    new Date().toISOString().slice(0, 10);

  const flatDays = getFlatRoutineDays(rutina);
  const map = new Map<string, { numeroSemana: number; nombreDia: string; ejercicioIds: string[] }>();

  flatDays.forEach((routineDay, index) => {
    const dateKey = getDateKeyForPlanDayIndex(rutina, startKey, index);
    map.set(dateKey, {
      numeroSemana: routineDay.numeroSemana,
      nombreDia: routineDay.dia.nombreDia,
      ejercicioIds: routineDay.dia.ejercicios.map((ejercicio) => ejercicio.id),
    });
  });

  return map;
}

function findProgresoBySemanaDia(
  records: RutinaProgresoRecord[],
  numeroSemana?: number,
  nombreDia?: string,
): RutinaProgresoRecord | undefined {
  if (!numeroSemana || !nombreDia) return undefined;
  return records.find(
    (record) =>
      record.numeroSemana === numeroSemana && record.nombreDia === nombreDia,
  );
}

async function migrateLocalStorageProgress(
  rutina: RutinaDetail,
  existingByDateKey: Record<string, RutinaProgresoRecord>,
): Promise<void> {
  const dateKeyMap = buildDateKeyMap(rutina);
  const completedDayKeys = new Set(readCompletedDayKeys(rutina.id));
  const migrations: UpsertRutinaProgresoPayload[] = [];

  for (const [dateKey, dayMeta] of dateKeyMap.entries()) {
    const existing = existingByDateKey[dateKey];
    const localExercises = normalizeExerciseIds(
      readExerciseHistory(dateKey),
      dayMeta.ejercicioIds,
    );
    const localDayCompleted = completedDayKeys.has(dateKey);

    if (
      localExercises.length === 0 &&
      !localDayCompleted &&
      !existing
    ) {
      continue;
    }

    const ejerciciosCompletados = [
      ...new Set([
        ...(existing?.ejerciciosCompletados ?? []),
        ...localExercises,
      ]),
    ];

    const diaCompletado = Boolean(existing?.diaCompletado || localDayCompleted);

    if (
      existing &&
      existing.ejerciciosCompletados.length === ejerciciosCompletados.length &&
      existing.diaCompletado === diaCompletado &&
      ejerciciosCompletados.every((id) =>
        existing.ejerciciosCompletados.includes(id),
      )
    ) {
      continue;
    }

    migrations.push({
      rutinaId: rutina.id,
      dateKey,
      numeroSemana: dayMeta.numeroSemana,
      nombreDia: dayMeta.nombreDia,
      ejerciciosCompletados,
      diaCompletado,
    });
  }

  if (migrations.length === 0) return;

  await Promise.all(
    migrations.map((payload) =>
      apiFetch("/api/rutina-progreso/upsert", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    ),
  );

  try {
    for (const dateKey of dateKeyMap.keys()) {
      window.localStorage.removeItem(`ivis-rutina-history:${dateKey}`);
    }
    window.localStorage.removeItem(`ivis-rutina-day-complete:${rutina.id}`);
  } catch {
    // Best-effort cleanup after migration.
  }
}

export function useRutinaProgreso(
  rutinaId: string | null | undefined,
  rutina?: RutinaDetail | null,
  enabled = true,
) {
  const [progresoByDateKey, setProgresoByDateKey] = useState<
    Record<string, RutinaProgresoRecord>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const migratedRef = useRef<string | null>(null);
  const invalidateGamificacion = useInvalidateGamificacion();

  const cacheKey = `rutina-progreso:${rutinaId}`;

  const fetchProgreso = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled || !rutinaId) {
        setProgresoByDateKey({});
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchCached<RutinaProgresoApiDoc[]>(
          cacheKey,
          (sig) =>
            apiFetch<RutinaProgresoApiDoc[]>(
              `/api/rutina-progreso?rutinaId=${encodeURIComponent(rutinaId)}`,
              { signal: sig },
            ),
          30_000,
          signal,
        );
        const records = data.map(mapRutinaProgresoRecord);
        const byDateKey = buildProgresoByDateKey(records);
        setProgresoByDateKey(byDateKey);

        if (
          rutina &&
          migratedRef.current !== rutina.id
        ) {
          migratedRef.current = rutina.id;
          await migrateLocalStorageProgress(rutina, byDateKey);
          invalidateCache(cacheKey);
          const refreshed = await apiFetch<RutinaProgresoApiDoc[]>(
            `/api/rutina-progreso?rutinaId=${encodeURIComponent(rutinaId)}`,
            { signal },
          );
          setProgresoByDateKey(
            buildProgresoByDateKey(refreshed.map(mapRutinaProgresoRecord)),
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el progreso de la rutina",
        );
        setProgresoByDateKey({});
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [cacheKey, enabled, rutina, rutinaId],
  );

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetchProgreso(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchProgreso]);

  const upsertProgreso = useCallback(
    async (payload: UpsertRutinaProgresoPayload) => {
      const saved = await apiFetch<RutinaProgresoApiDoc>(
        "/api/rutina-progreso/upsert",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
      const record = mapRutinaProgresoRecord(saved);
      setProgresoByDateKey((current) => ({
        ...current,
        [record.dateKey]: record,
      }));
      invalidateCache(cacheKey);
      invalidateGamificacion();
      return record;
    },
    [cacheKey, invalidateGamificacion],
  );

  const getDayProgreso = useCallback(
    (
      dateKey: string,
      numeroSemana?: number,
      nombreDia?: string,
    ): RutinaProgresoRecord | undefined => {
      if (progresoByDateKey[dateKey]) return progresoByDateKey[dateKey];
      return findProgresoBySemanaDia(
        Object.values(progresoByDateKey),
        numeroSemana,
        nombreDia,
      );
    },
    [progresoByDateKey],
  );

  const completedDateKeys = useMemo(
    () =>
      new Set(
        Object.values(progresoByDateKey)
          .filter((record) => record.diaCompletado)
          .map((record) => record.dateKey),
      ),
    [progresoByDateKey],
  );

  return {
    progresoByDateKey,
    completedDateKeys,
    loading,
    error,
    refetch: fetchProgreso,
    upsertProgreso,
    getDayProgreso,
  };
}

export function getExerciseCompletionIds(
  day: ChallengeDay,
  progreso?: RutinaProgresoRecord,
): string[] {
  return progreso?.ejerciciosCompletados ?? [];
}

export function resolveDayDateKey(
  rutina: RutinaDetail,
  day: ChallengeDay,
): string {
  if (day.numeroSemana && day.nombreDia) {
    const flatDays = getFlatRoutineDays(rutina);
    const index = flatDays.findIndex(
      (routineDay) =>
        routineDay.numeroSemana === day.numeroSemana &&
        routineDay.dia.nombreDia === day.nombreDia,
    );
    if (index >= 0) {
      const startKey =
        rutina.startDate?.slice(0, 10) ??
        rutina.createdAt?.slice(0, 10) ??
        day.dateKey;
      return getDateKeyForPlanDayIndex(rutina, startKey, index);
    }
  }

  return day.dateKey;
}

export { getRutinaDayDateKey };