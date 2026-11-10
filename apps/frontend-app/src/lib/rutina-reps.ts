export const SERIES_MIN = 1;
export const SERIES_MAX = 8;
export const REPS_MIN = 1;
export const REPS_MAX = 100;
export const SEGUNDOS_MAX = 600;
export const PRESCRIPCION_MAX = SEGUNDOS_MAX;

export type UnidadEjercicio = "repeticiones" | "segundos";
export type RegistroEjercicio = "peso" | "check";

export function normalizeUnidad(value: unknown): UnidadEjercicio {
  return value === "segundos" ? "segundos" : "repeticiones";
}

export function normalizeRegistro(value: unknown): RegistroEjercicio {
  return value === "check" ? "check" : "peso";
}

export function prescriptionMax(unidad: UnidadEjercicio): number {
  return unidad === "segundos" ? SEGUNDOS_MAX : REPS_MAX;
}

export function clampPrescription(value: number, unidad: UnidadEjercicio): number {
  const max = prescriptionMax(unidad);
  if (!Number.isFinite(value)) return REPS_MIN;
  return Math.min(max, Math.max(REPS_MIN, Math.round(value)));
}

export function isRepeticionesPorSerieActive(
  series: number,
  repeticionesPorSerie?: number[],
): repeticionesPorSerie is number[] {
  return (
    Array.isArray(repeticionesPorSerie) &&
    repeticionesPorSerie.length === series &&
    repeticionesPorSerie.length > 0
  );
}

export function resizeRepeticionesPorSerie(
  nextSeries: number,
  repeticiones: number,
  current?: number[],
): number[] {
  const count = Math.min(Math.max(nextSeries, SERIES_MIN), SERIES_MAX);
  const source =
    current && current.length > 0 ? current : Array.from({ length: count }, () => repeticiones);
  const last = source[source.length - 1] ?? repeticiones;
  return Array.from({ length: count }, (_, index) => source[index] ?? last);
}

export function persistRepeticionesPorSerie(
  series: number,
  repeticiones: number,
  repeticionesPorSerie?: number[],
): number[] | undefined {
  if (!isRepeticionesPorSerieActive(series, repeticionesPorSerie)) {
    return undefined;
  }
  const first = repeticionesPorSerie[0] ?? repeticiones;
  if (repeticionesPorSerie.every((value) => value === first)) return undefined;
  return repeticionesPorSerie;
}

export function formatSeriesReps(
  series: number,
  repeticiones: number,
  repeticionesPorSerie?: number[],
  timesSymbol = "×",
  unidad: UnidadEjercicio = "repeticiones",
): string {
  const body = isRepeticionesPorSerieActive(series, repeticionesPorSerie)
    ? repeticionesPorSerie.join("/")
    : `${series} ${timesSymbol} ${repeticiones}`;
  return unidad === "segundos" ? `${body} s` : body;
}
