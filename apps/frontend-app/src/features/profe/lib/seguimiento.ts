import type { ChallengeDay } from "@/features/alumna/lib/rutina-day";
import type { RutinaProgresoRecord } from "@/features/alumna/types/rutina-progreso";
import type { LogPesoRecord } from "@/features/alumna/types/log-peso";

export type SeguimientoDayStatus =
  | "completado"
  | "en_curso"
  | "pendiente"
  | "futuro";

export type SeguimientoDayView = {
  day: ChallengeDay;
  status: SeguimientoDayStatus;
  progreso?: RutinaProgresoRecord;
  completedExerciseCount: number;
  totalExerciseCount: number;
};

export type SeguimientoExerciseView = {
  id: string;
  nombre: string;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
  completado: boolean;
  pesosPorSerie: number[];
};

export type SeguimientoStats = {
  progressPercent: number;
  completedDays: number;
  totalDays: number;
  activeDays: number;
  currentDayNumber: number;
  currentDayTitle: string;
};

export function buildPesosBySlot(
  logs: LogPesoRecord[],
): Record<string, number[]> {
  return logs.reduce<Record<string, number[]>>((acc, log) => {
    const key = `${log.semana}|${log.dia}|${log.ejercicioId}`;
    acc[key] = log.pesosPorSerie;
    return acc;
  }, {});
}

export function resolveDayStatus(
  day: ChallengeDay,
  progreso?: RutinaProgresoRecord,
): SeguimientoDayStatus {
  const total = day.ejercicios.length;
  const completedCount = progreso?.ejerciciosCompletados.length ?? 0;
  const diaCompletado =
    progreso?.diaCompletado ||
    (total > 0 && completedCount >= total);

  if (diaCompletado) return "completado";
  if (day.isToday) return completedCount > 0 ? "en_curso" : "en_curso";
  if (day.state === "locked") return "futuro";
  if (day.state === "completed" && !progreso) return "pendiente";
  if (completedCount > 0) return "en_curso";
  return "pendiente";
}

export function buildSeguimientoDays(
  days: ChallengeDay[],
  progresoByDateKey: Record<string, RutinaProgresoRecord>,
): SeguimientoDayView[] {
  const progresoRecords = Object.values(progresoByDateKey);

  return days.map((day) => {
    const progreso =
      progresoByDateKey[day.dateKey] ??
      progresoRecords.find(
        (record) =>
          record.numeroSemana === day.numeroSemana &&
          record.nombreDia === day.nombreDia,
      );
    const totalExerciseCount = day.ejercicios.length;
    const completedExerciseCount = progreso?.ejerciciosCompletados.length ?? 0;

    return {
      day,
      status: resolveDayStatus(day, progreso),
      progreso,
      completedExerciseCount,
      totalExerciseCount,
    };
  });
}

export function buildSeguimientoStats(
  dayViews: SeguimientoDayView[],
): SeguimientoStats {
  const totalDays = dayViews.length;
  const completedDays = dayViews.filter(
    (view) => view.status === "completado",
  ).length;
  const todayView =
    dayViews.find((view) => view.day.isToday) ??
    dayViews.find((view) => view.status === "en_curso");
  const unlockedDays = dayViews.filter((view) => view.day.state !== "locked");
  const activeDays = unlockedDays.length;

  return {
    progressPercent: Math.round((completedDays / Math.max(totalDays, 1)) * 100),
    completedDays,
    totalDays,
    activeDays,
    currentDayNumber: todayView?.day.dayNumber ?? 1,
    currentDayTitle: todayView?.day.title ?? "Sin día activo",
  };
}

export function buildExerciseViews(
  dayView: SeguimientoDayView,
  pesosBySlot: Record<string, number[]>,
): SeguimientoExerciseView[] {
  const { day, progreso } = dayView;
  const completedSet = new Set(progreso?.ejerciciosCompletados ?? []);

  return day.ejercicios.map((ejercicio) => {
    const slotKey = `${day.numeroSemana}|${day.nombreDia}|${ejercicio.id}`;
    return {
      id: ejercicio.id,
      nombre: ejercicio.nombre,
      series: ejercicio.series,
      repeticiones: ejercicio.repeticiones,
      descansoSegundos: ejercicio.descansoSegundos,
      completado: completedSet.has(ejercicio.id),
      pesosPorSerie: pesosBySlot[slotKey] ?? [],
    };
  });
}

export function formatPesosLabel(pesos: number[]): string {
  if (pesos.length === 0) return "Sin pesos";
  return pesos.map((peso, index) => `S${index + 1}: ${peso}kg`).join(" · ");
}

export const dayStatusLabels: Record<SeguimientoDayStatus, string> = {
  completado: "Completado",
  en_curso: "En curso",
  pendiente: "Pendiente",
  futuro: "Próximo",
};

function formatDateKeyLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatUpdatedAtLabel(updatedAt: string): string {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "Completado";
  return date.toLocaleDateString("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatSeguimientoDayDateLabel(
  dayView: SeguimientoDayView,
): string {
  if (dayView.status !== "completado") {
    return "Falta por cumplir";
  }

  const { progreso } = dayView;
  if (progreso?.fechaCompletado) {
    return formatDateKeyLabel(progreso.fechaCompletado);
  }

  if (progreso?.updatedAt) {
    return formatUpdatedAtLabel(progreso.updatedAt);
  }

  return "Completado";
}
