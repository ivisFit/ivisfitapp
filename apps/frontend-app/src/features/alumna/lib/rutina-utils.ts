import { getTodayDateKey } from "@/features/alumna/lib/rutina-day";

export type RutinaPickCandidate = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  startDate?: string | Date;
  duracionSemanas?: number;
};

/** Fecha YYYY-MM-DD tal como se guardó, sin correr el día por el huso. */
export function rutinaDateKey(value?: string | Date | null): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (match) return match[1];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return rutinaDateKey(parsed);
}

export function addCalendarDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function toTime(value?: string | Date): number {
  if (!value) return 0;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function rutinaStartKey(rutina: RutinaPickCandidate): string | null {
  return rutinaDateKey(rutina.startDate) ?? rutinaDateKey(rutina.createdAt);
}

/** Primer día que ya no pertenece a esta rutina: inicio + duración en semanas. */
export function rutinaEndExclusiveKey(rutina: RutinaPickCandidate): string | null {
  const start = rutinaStartKey(rutina);
  const weeks = rutina.duracionSemanas ?? 0;
  if (!start || weeks < 1) return null;
  return addCalendarDays(start, weeks * 7);
}

export function rutinaEndInclusiveKey(rutina: RutinaPickCandidate): string | null {
  const end = rutinaEndExclusiveKey(rutina);
  if (!end) return null;
  return addCalendarDays(end, -1);
}

export function rutinaCoversDate(
  rutina: RutinaPickCandidate,
  todayKey: string,
): boolean {
  const start = rutinaStartKey(rutina);
  const end = rutinaEndExclusiveKey(rutina);
  if (!start || !end) return false;
  return start <= todayKey && todayKey < end;
}

function byStartThenCreated(
  a: RutinaPickCandidate,
  b: RutinaPickCandidate,
): number {
  const startDiff = (rutinaStartKey(a) ?? "").localeCompare(rutinaStartKey(b) ?? "");
  if (startDiff !== 0) return startDiff;
  return toTime(a.createdAt) - toTime(b.createdAt);
}

/**
 * La rutina que la alumna ve hoy.
 * Si alguna incluye hoy, gana la que empezó antes.
 * Si ninguna incluye hoy, sigue la última que ya empezó hasta que la próxima entre en su calendario.
 */
export function pickPrimaryRutina<T extends RutinaPickCandidate>(
  rutinas: T[],
  now: Date = new Date(),
): T | null {
  if (rutinas.length === 0) return null;

  const today = getTodayDateKey(now);
  const covering = rutinas.filter((rutina) => rutinaCoversDate(rutina, today));
  if (covering.length > 0) {
    return [...covering].sort(byStartThenCreated)[0];
  }

  const started = rutinas.filter((rutina) => {
    const start = rutinaStartKey(rutina);
    return start !== null && start <= today;
  });
  if (started.length > 0) {
    return [...started].sort((a, b) => byStartThenCreated(b, a))[0];
  }

  const upcoming = rutinas.filter((rutina) => {
    const start = rutinaStartKey(rutina);
    return start !== null && start > today;
  });
  if (upcoming.length > 0) {
    return [...upcoming].sort(byStartThenCreated)[0];
  }

  return [...rutinas].sort(
    (a, b) =>
      toTime(b.updatedAt ?? b.createdAt ?? b.startDate) -
      toTime(a.updatedAt ?? a.createdAt ?? a.startDate),
  )[0];
}

export function formatRutinaDateKey(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRutinaDateKeyLong(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  return new Intl.DateTimeFormat("es-UY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Inicio sugerido para una rutina nueva: el día después de la que termina más tarde, o hoy. */
export function suggestedNextRutinaStart(
  rutinas: RutinaPickCandidate[],
  todayKey: string,
): string {
  const latestEnd = rutinas
    .map((rutina) => rutinaEndExclusiveKey(rutina))
    .filter((key): key is string => Boolean(key))
    .sort()
    .at(-1);

  if (!latestEnd || latestEnd < todayKey) return todayKey;
  return latestEnd;
}
