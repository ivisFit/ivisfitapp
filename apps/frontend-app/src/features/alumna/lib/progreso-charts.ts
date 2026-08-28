import type { LogPesoRecord } from "@/features/alumna/types/log-peso";
import type { RutinaProgresoRecord } from "@/features/alumna/types/rutina-progreso";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import {
  getDateKeyForPlanDayIndex,
  getFlatRoutineDays,
} from "@/features/alumna/lib/rutina-day";

const TIME_ZONE = "America/Montevideo";

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

const DAY_ORDER: Record<string, number> = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
  Sabado: 6,
  Domingo: 7,
};

export type CargaChartPoint = {
  label: string;
  pesoMax: number;
  semana: number;
  dia: string;
  sortKey: number;
};

export type EjercicioCargaSeries = {
  ejercicioId: string;
  nombre: string;
  puntos: CargaChartPoint[];
};

export type CumplimientoChartPoint = {
  dia: string;
  dateKey: string;
  porcentaje: number;
  completado: boolean;
};

export type CumplimientoSummary = {
  completados: number;
  total: number;
  puntos: CumplimientoChartPoint[];
};

export type LogPesoWithNombre = LogPesoRecord & {
  ejercicioNombre?: string;
};

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
  };
}

function toDateKey(parts: { year: number; month: number; day: number }): string {
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

function toDateKeyFromDate(date: Date, timeZone = TIME_ZONE): string {
  return toDateKey(getDatePartsInTimeZone(date, timeZone));
}

function addDaysToDateKey(dateKey: string, daysToAdd: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

function weekdayLabelFromDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  return WEEKDAY_LABELS[date.getUTCDay()] ?? dateKey;
}

function resolveDayOrder(dia: string): number {
  return DAY_ORDER[dia] ?? 99;
}

function resolveSortKey(semana: number, dia: string): number {
  return semana * 100 + resolveDayOrder(dia);
}

function resolveMaxPeso(pesosPorSerie: number[]): number {
  const valid = pesosPorSerie.filter(
    (value) => typeof value === "number" && !Number.isNaN(value) && value >= 0,
  );
  if (valid.length === 0) return 0;
  return Math.max(...valid);
}

function formatSessionLabel(
  semana: number,
  dia: string,
  fecha?: string,
): string {
  if (fecha) {
    const parsed = new Date(fecha);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "short",
        timeZone: TIME_ZONE,
      });
    }
  }
  return `Sem ${semana} · ${dia}`;
}

export function buildLast7DateKeys(
  now: Date = new Date(),
  timeZone = TIME_ZONE,
): string[] {
  const todayKey = toDateKeyFromDate(now, timeZone);
  return Array.from({ length: 7 }, (_, index) =>
    addDaysToDateKey(todayKey, index - 6),
  );
}

function buildExerciseCountByDateKey(
  rutina: RutinaDetail,
): Map<string, number> {
  const startKey =
    rutina.startDate?.slice(0, 10) ??
    rutina.createdAt?.slice(0, 10) ??
    toDateKeyFromDate(new Date());

  const flatDays = getFlatRoutineDays(rutina);
  const map = new Map<string, number>();

  flatDays.forEach((routineDay, index) => {
    const dateKey = getDateKeyForPlanDayIndex(rutina, startKey, index);
    map.set(dateKey, routineDay.dia.ejercicios.length);
  });

  return map;
}

function resolveCompliancePercent(
  progreso: RutinaProgresoRecord | undefined,
  totalExercises: number,
): { porcentaje: number; completado: boolean } {
  if (!progreso) {
    return { porcentaje: 0, completado: false };
  }

  if (progreso.diaCompletado) {
    return { porcentaje: 100, completado: true };
  }

  const completedCount = progreso.ejerciciosCompletados.length;
  if (totalExercises > 0 && completedCount > 0) {
    const porcentaje = Math.round((completedCount / totalExercises) * 100);
    return { porcentaje, completado: false };
  }

  if (completedCount > 0) {
    return { porcentaje: 50, completado: false };
  }

  return { porcentaje: 0, completado: false };
}

export function buildCumplimientoSummary(
  progresoByDateKey: Record<string, RutinaProgresoRecord>,
  rutina?: RutinaDetail | null,
  now: Date = new Date(),
): CumplimientoSummary {
  const dateKeys = buildLast7DateKeys(now);
  const exerciseCountByDateKey = rutina
    ? buildExerciseCountByDateKey(rutina)
    : new Map<string, number>();

  const puntos = dateKeys.map((dateKey) => {
    const progreso = progresoByDateKey[dateKey];
    const totalExercises = exerciseCountByDateKey.get(dateKey) ?? 0;
    const { porcentaje, completado } = resolveCompliancePercent(
      progreso,
      totalExercises,
    );

    return {
      dia: weekdayLabelFromDateKey(dateKey),
      dateKey,
      porcentaje,
      completado,
    };
  });

  const completados = puntos.filter((point) => point.completado).length;

  return {
    completados,
    total: puntos.length,
    puntos,
  };
}

export function buildCargaSeriesByEjercicio(
  logs: LogPesoWithNombre[],
): EjercicioCargaSeries[] {
  const byEjercicio = new Map<
    string,
    { nombre: string; puntos: CargaChartPoint[] }
  >();

  for (const log of logs) {
    const pesoMax = resolveMaxPeso(log.pesosPorSerie);
    if (pesoMax <= 0 || !log.ejercicioId) continue;

    const point: CargaChartPoint = {
      label: formatSessionLabel(log.semana, log.dia, log.fecha),
      pesoMax,
      semana: log.semana,
      dia: log.dia,
      sortKey: resolveSortKey(log.semana, log.dia),
    };

    const nombre =
      log.ejercicioNombre?.trim() || `Ejercicio ${log.ejercicioId.slice(-4)}`;
    const existing = byEjercicio.get(log.ejercicioId);

    if (existing) {
      existing.puntos.push(point);
      if (log.ejercicioNombre?.trim()) {
        existing.nombre = log.ejercicioNombre.trim();
      }
    } else {
      byEjercicio.set(log.ejercicioId, { nombre, puntos: [point] });
    }
  }

  return Array.from(byEjercicio.entries())
    .map(([ejercicioId, { nombre, puntos }]) => ({
      ejercicioId,
      nombre,
      puntos: [...puntos].sort((a, b) => a.sortKey - b.sortKey),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
