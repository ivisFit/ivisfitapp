import type { ChallengeDay } from "@/features/alumna/lib/rutina-day";
import {
  getDateKeyForFlatRoutineDay,
  getFlatRoutineDays,
  type RutinaDay,
} from "@/features/alumna/lib/rutina-day";
import type { RutinaDetail } from "@/features/alumna/types/rutina";

export function getExerciseHistoryKey(dateKey: string): string {
  return `ivis-rutina-history:${dateKey}`;
}

export function getDayCompletionStorageKey(rutinaId: string): string {
  return `ivis-rutina-day-complete:${rutinaId}`;
}

export function getRutinaDayDateKey(
  rutina: RutinaDetail,
  dayInfo: RutinaDay,
): string {
  const flatDays = getFlatRoutineDays(rutina);
  const index = flatDays.findIndex(
    (routineDay) =>
      routineDay.numeroSemana === dayInfo.numeroSemana &&
      routineDay.dia.nombreDia === dayInfo.nombreDia,
  );

  if (index < 0) {
    return dayInfo.todayKey;
  }

  return getDateKeyForFlatRoutineDay(rutina, dayInfo.startDateKey, index);
}

export function readCompletedDayKeys(rutinaId: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(getDayCompletionStorageKey(rutinaId));
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function markDayCompleted(rutinaId: string, dateKey: string): string[] {
  const next = [...new Set([...readCompletedDayKeys(rutinaId), dateKey])];

  try {
    window.localStorage.setItem(
      getDayCompletionStorageKey(rutinaId),
      JSON.stringify(next),
    );
  } catch {
    // Local progress is best-effort until persisted progress exists in the API.
  }

  return next;
}

export function readExerciseHistory(dateKey: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(getExerciseHistoryKey(dateKey));
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeExerciseHistory(dateKey: string, completedKeys: string[]): void {
  try {
    window.localStorage.setItem(
      getExerciseHistoryKey(dateKey),
      JSON.stringify(completedKeys),
    );
  } catch {
    // Local history is best-effort until persisted progress exists in the API.
  }
}

export function applyManualDayCompletions(
  days: ChallengeDay[],
  completedDateKeys: ReadonlySet<string>,
  getDayProgreso?: (
    dateKey: string,
    numeroSemana?: number,
    nombreDia?: string,
  ) => { diaCompletado?: boolean } | undefined,
): ChallengeDay[] {
  return days.map((day) => {
    const isCompleted =
      completedDateKeys.has(day.dateKey) ||
      Boolean(
        getDayProgreso?.(day.dateKey, day.numeroSemana, day.nombreDia)
          ?.diaCompletado,
      );

    return isCompleted ? { ...day, state: "completed" } : day;
  });
}
