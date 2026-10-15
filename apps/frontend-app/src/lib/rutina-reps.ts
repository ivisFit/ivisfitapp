export const SERIES_MIN = 1;
export const SERIES_MAX = 8;
export const REPS_MIN = 1;
export const REPS_MAX = 25;

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
): string {
  if (isRepeticionesPorSerieActive(series, repeticionesPorSerie)) {
    return repeticionesPorSerie.join("/");
  }
  return `${series} ${timesSymbol} ${repeticiones}`;
}
