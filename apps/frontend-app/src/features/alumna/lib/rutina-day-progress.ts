import type { ChallengeDay } from "@/features/alumna/lib/rutina-day";
import {
  getDateKeyForFlatRoutineDay,
  getFlatRoutineDays,
  getTodayDateKey,
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

type DayProgresoFlags = {
  diaCompletado?: boolean;
  diaOmitido?: boolean;
};

type ExerciseDoneInput = {
  id: string;
  registro?: "peso" | "check";
};

export function hasSavedExerciseWeight(pesos: number[] | undefined): boolean {
  return Boolean(pesos?.some((peso) => Number.isFinite(peso) && peso >= 0));
}

/** Un ejercicio de peso cuenta como hecho si está marcado o si ya hay un log de esta semana. */
export function isPlanExerciseDone(
  ejercicio: ExerciseDoneInput,
  completedIds: ReadonlySet<string>,
  logsByEjercicioId: Record<string, number[]>,
): boolean {
  if (ejercicio.id && completedIds.has(ejercicio.id)) return true;
  if (ejercicio.registro === "check") return false;
  return hasSavedExerciseWeight(logsByEjercicioId[ejercicio.id]);
}

export function isRoutineDayReallyComplete(
  progreso: DayProgresoFlags | undefined,
  locallyCompleted = false,
): boolean {
  if (progreso?.diaOmitido) return false;
  return Boolean(progreso?.diaCompletado || locallyCompleted);
}

export function applyManualDayCompletions(
  days: ChallengeDay[],
  completedDateKeys: ReadonlySet<string>,
  getDayProgreso?: (
    dateKey: string,
    numeroSemana?: number,
    nombreDia?: string,
  ) => DayProgresoFlags | undefined,
): ChallengeDay[] {
  const todayKey = getTodayDateKey();

  return days.map((day) => {
    const progreso = getDayProgreso?.(
      day.dateKey,
      day.numeroSemana,
      day.nombreDia,
    );
    const reallyComplete = isRoutineDayReallyComplete(
      progreso,
      completedDateKeys.has(day.dateKey),
    );

    if (reallyComplete) {
      return { ...day, state: "completed" };
    }

    if (
      progreso?.diaOmitido ||
      (day.state !== "locked" && day.dateKey < todayKey)
    ) {
      return { ...day, state: "missed" };
    }

    if (day.state === "completed") {
      return { ...day, state: "unlocked" };
    }

    return day;
  });
}

