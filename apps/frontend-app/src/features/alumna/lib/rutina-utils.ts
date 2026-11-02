import {
  URUGUAY_TIME_ZONE,
  addCalendarDays,
  instantToUruguayDateKey,
  profeCalendarDateKey,
} from "@ivisfit/database";

export type RutinaPickCandidate = {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  startDate?: string | Date;
  duracionSemanas?: number;
};

/** Fecha YYYY-MM-DD del inicio elegido por la profe (día civil exacto). */
export function rutinaDateKey(value?: string | Date | null): string | null {
  return profeCalendarDateKey(value ?? null);
}

export { addCalendarDays };

export function toTime(value?: string | Date): number {
  if (!value) return 0;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function rutinaStartKey(rutina: RutinaPickCandidate): string | null {
  return (
    profeCalendarDateKey(rutina.startDate) ??
    instantToUruguayDateKey(rutina.createdAt)
  );
}

/** Primer día que ya no pertenece a esta rutina: inicio + duración en semanas. */
export function rutinaEndExclusiveKey(rutina: RutinaPickCandidate): string | null {
  const start = rutinaStartKey(rutina);
  const weeks = rutina.duracionSemanas ?? 0;
  if (!start || weeks < 1) return null;
  return addCalendarDays(start, weeks * 7);
}

function rutinaCoversDate(rutina: RutinaPickCandidate, day: string): boolean {
  const start = rutinaStartKey(rutina);
  const end = rutinaEndExclusiveKey(rutina);
  if (!start || !end) return false;
  return start <= day && day < end;
}

function byStartThenCreated(a: RutinaPickCandidate, b: RutinaPickCandidate): number {
  const startDiff = (rutinaStartKey(a) ?? "").localeCompare(rutinaStartKey(b) ?? "");
  if (startDiff !== 0) return startDiff;
  return toTime(a.createdAt) - toTime(b.createdAt);
}

export function pickPrimaryRutina<T extends RutinaPickCandidate>(
  rutinas: T[],
  now: Date = new Date(),
): T | null {
  if (rutinas.length === 0) return null;

  const today = instantToUruguayDateKey(now) ?? "";
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

export { URUGUAY_TIME_ZONE };
