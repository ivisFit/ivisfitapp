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
import { instantToUruguayDateKey } from "@ivisfit/database/calendar";
import { rutinaStartKey } from "@/features/alumna/lib/rutina-utils";
import {
  buildProgresoByDateKey,
  mapRutinaProgresoRecord,
  type RutinaProgresoApiDoc,
  type RutinaProgresoRecord,
  type UpsertRutinaProgresoPayload,
} from "@/features/alumna/types/rutina-progreso";

function progressWriteKey(payload: UpsertRutinaProgresoPayload): string {
  return `${payload.rutinaId}:${payload.dateKey}`;
}

function sameProgressWrite(
  left: UpsertRutinaProgresoPayload,
  right: UpsertRutinaProgresoPayload,
): boolean {
  if (left.diaCompletado !== right.diaCompletado) return false;
  if (Boolean(left.diaOmitido) !== Boolean(right.diaOmitido)) return false;
  if (left.numeroSemana !== right.numeroSemana) return false;
  if (left.nombreDia !== right.nombreDia) return false;
  if (left.ejerciciosCompletados.length !== right.ejerciciosCompletados.length) {
    return false;
  }
  const ids = new Set(left.ejerciciosCompletados);
  return right.ejerciciosCompletados.every((id) => ids.has(id));
}

/** Une listas de ejercicios sin perder marcas paralelas. Quitar un id sí se respeta. */
export function mergeExerciseCompletionIds(base: string[], next: string[]): string[] {
  const baseIds = new Set(base);
  const nextIds = new Set(next);
  const removed = base.filter((id) => !nextIds.has(id));
  const added = next.filter((id) => !baseIds.has(id));

  if (removed.length === 1 && added.length === 0) return [...nextIds];
  if (removed.length > 1 && added.length === 0) return [...baseIds];
  return [...new Set([...base, ...next])];
}

export function coalesceProgressWrite(
  previous: UpsertRutinaProgresoPayload | undefined,
  next: UpsertRutinaProgresoPayload,
  server: RutinaProgresoRecord | undefined,
): UpsertRutinaProgresoPayload {
  const explicitOmit = next.diaOmitido === true && next.diaCompletado === false;
  if (explicitOmit) {
    return { ...next, diaCompletado: false, diaOmitido: true };
  }

  const explicitComplete = next.diaCompletado === true && next.diaOmitido !== true;
  const serverCompleted = Boolean(server?.diaCompletado && !server.diaOmitido);
  const keepCompleted =
    explicitComplete || Boolean(previous?.diaCompletado) || serverCompleted;
  const baseIds =
    previous?.ejerciciosCompletados ?? server?.ejerciciosCompletados ?? [];
  const ejerciciosCompletados = explicitComplete
    ? [...new Set([...baseIds, ...next.ejerciciosCompletados])]
    : mergeExerciseCompletionIds(baseIds, next.ejerciciosCompletados);

  return {
    ...next,
    ejerciciosCompletados,
    diaCompletado: keepCompleted,
    diaOmitido: keepCompleted ? false : Boolean(next.diaOmitido ?? previous?.diaOmitido),
  };
}

function optimisticProgresoRecord(
  payload: UpsertRutinaProgresoPayload,
  existing: RutinaProgresoRecord | undefined,
): RutinaProgresoRecord {
  return {
    id: existing?.id ?? "",
    rutinaId: payload.rutinaId,
    dateKey: payload.dateKey,
    numeroSemana: payload.numeroSemana,
    nombreDia: payload.nombreDia,
    ejerciciosCompletados: payload.ejerciciosCompletados,
    diaCompletado: payload.diaCompletado,
    diaOmitido: payload.diaOmitido ?? false,
    ...(existing?.fechaCompletado
      ? { fechaCompletado: existing.fechaCompletado }
      : {}),
    ...(existing?.updatedAt ? { updatedAt: existing.updatedAt } : {}),
  };
}

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
    rutinaStartKey(rutina) ??
    instantToUruguayDateKey(new Date()) ??
    "";

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
  const progresoRef = useRef(progresoByDateKey);
  progresoRef.current = progresoByDateKey;
  const committedRef = useRef<Record<string, RutinaProgresoRecord>>({});
  const desiredWritesRef = useRef(
    new Map<string, UpsertRutinaProgresoPayload>(),
  );
  const writeChainRef = useRef(new Map<string, Promise<void>>());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const migratedRef = useRef<string | null>(null);
  const invalidateGamificacion = useInvalidateGamificacion();

  const applyProgreso = useCallback((record: RutinaProgresoRecord) => {
    setProgresoByDateKey((current) => {
      const next = { ...current, [record.dateKey]: record };
      progresoRef.current = next;
      return next;
    });
  }, []);

  const publishFetchedProgreso = useCallback(
    (fetched: Record<string, RutinaProgresoRecord>) => {
      committedRef.current = fetched;
      setProgresoByDateKey((current) => {
        const next = { ...fetched };
        for (const write of desiredWritesRef.current.values()) {
          next[write.dateKey] = optimisticProgresoRecord(
            write,
            current[write.dateKey] ?? fetched[write.dateKey],
          );
        }
        progresoRef.current = next;
        return next;
      });
    },
    [],
  );

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
        publishFetchedProgreso(byDateKey);

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
          publishFetchedProgreso(
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
        if (desiredWritesRef.current.size === 0) {
          committedRef.current = {};
          progresoRef.current = {};
          setProgresoByDateKey({});
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [cacheKey, enabled, publishFetchedProgreso, rutina, rutinaId],
  );

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void fetchProgreso(controller.signal);
    return () => controller.abort();
  }, [enabled, fetchProgreso]);

  const restoreCommitted = useCallback((dateKey: string) => {
    const committed = committedRef.current[dateKey];
    if (committed) {
      applyProgreso(committed);
      return;
    }

    setProgresoByDateKey((current) => {
      if (!current[dateKey]) return current;
      const next = { ...current };
      delete next[dateKey];
      progresoRef.current = next;
      return next;
    });
  }, [applyProgreso]);

  const upsertProgreso = useCallback(
    async (payload: UpsertRutinaProgresoPayload) => {
      const key = progressWriteKey(payload);
      const merged = coalesceProgressWrite(
        desiredWritesRef.current.get(key),
        payload,
        committedRef.current[payload.dateKey],
      );
      desiredWritesRef.current.set(key, merged);
      applyProgreso(
        optimisticProgresoRecord(merged, progresoRef.current[payload.dateKey]),
      );

      const previous = writeChainRef.current.get(key) ?? Promise.resolve();
      const current = previous.catch(() => undefined).then(async () => {
        let lastSent: UpsertRutinaProgresoPayload | null = null;

        while (true) {
          const next = desiredWritesRef.current.get(key);
          if (!next || (lastSent && sameProgressWrite(lastSent, next))) {
            if (next && lastSent && sameProgressWrite(lastSent, next)) {
              desiredWritesRef.current.delete(key);
            }
            return;
          }

          lastSent = next;
          try {
            const saved = await apiFetch<RutinaProgresoApiDoc>(
              "/api/rutina-progreso/upsert",
              {
                method: "PUT",
                body: JSON.stringify(next),
              },
            );
            const record = mapRutinaProgresoRecord(saved);
            const stillDesired = desiredWritesRef.current.get(key);
            if (!stillDesired || sameProgressWrite(stillDesired, next)) {
              committedRef.current = {
                ...committedRef.current,
                [record.dateKey]: record,
              };
              applyProgreso(record);
            }
            invalidateCache(cacheKey);
            invalidateGamificacion();
          } catch (err) {
            const stillDesired = desiredWritesRef.current.get(key);
            if (stillDesired && !sameProgressWrite(stillDesired, next)) {
              continue;
            }
            desiredWritesRef.current.delete(key);
            restoreCommitted(next.dateKey);
            throw err;
          }
        }
      });
      writeChainRef.current.set(key, current);

      try {
        await current;
      } finally {
        if (writeChainRef.current.get(key) === current) {
          writeChainRef.current.delete(key);
        }
      }

      const record = progresoRef.current[payload.dateKey];
      if (!record) {
        throw new Error("No se pudo guardar el progreso de la rutina");
      }
      return record;
    },
    [applyProgreso, cacheKey, invalidateGamificacion, restoreCommitted],
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
          .filter((record) => record.diaCompletado && !record.diaOmitido)
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
      const startKey = rutinaStartKey(rutina) ?? day.dateKey;
      return getDateKeyForPlanDayIndex(rutina, startKey, index);
    }
  }

  return day.dateKey;
}

export { getRutinaDayDateKey };