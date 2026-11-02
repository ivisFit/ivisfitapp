/**
 * Misma regla que apps/frontend-app/src/features/alumna/lib/rutina-utils.ts:
 * la alumna ve la rutina cuyo calendario incluye hoy; si hay solape, la que empezó antes.
 */

export type RutinaScheduleCandidate = {
  _id?: unknown;
  id?: unknown;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  startDate?: string | Date | null;
  duracionSemanas?: number | null;
};

const TIME_ZONE = "America/Montevideo";

export function todayKey(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

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

function toTime(value?: string | Date | null): number {
  if (!value) return 0;
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function rutinaStartKey(rutina: RutinaScheduleCandidate): string | null {
  return rutinaDateKey(rutina.startDate) ?? rutinaDateKey(rutina.createdAt);
}

export function rutinaEndExclusiveKey(rutina: RutinaScheduleCandidate): string | null {
  const start = rutinaStartKey(rutina);
  const weeks = rutina.duracionSemanas ?? 0;
  if (!start || weeks < 1) return null;
  return addCalendarDays(start, weeks * 7);
}

function rutinaCoversDate(rutina: RutinaScheduleCandidate, day: string): boolean {
  const start = rutinaStartKey(rutina);
  const end = rutinaEndExclusiveKey(rutina);
  if (!start || !end) return false;
  return start <= day && day < end;
}

function byStartThenCreated(
  a: RutinaScheduleCandidate,
  b: RutinaScheduleCandidate,
): number {
  const startDiff = (rutinaStartKey(a) ?? "").localeCompare(rutinaStartKey(b) ?? "");
  if (startDiff !== 0) return startDiff;
  return toTime(a.createdAt) - toTime(b.createdAt);
}

export function pickPrimaryRutina<T extends RutinaScheduleCandidate>(
  rutinas: T[],
  now: Date = new Date(),
): T | null {
  if (rutinas.length === 0) return null;

  const today = todayKey(now);
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

function sameRutina(
  a: RutinaScheduleCandidate,
  b: RutinaScheduleCandidate,
): boolean {
  const aId = a._id ?? a.id;
  const bId = b._id ?? b.id;
  if (aId == null || bId == null) return false;
  return String(aId) === String(bId);
}

export function isRutinaVisibleToday(
  rutina: RutinaScheduleCandidate,
  rutinas: RutinaScheduleCandidate[],
  now: Date = new Date(),
): boolean {
  const primary = pickPrimaryRutina(rutinas, now);
  return primary !== null && sameRutina(primary, rutina);
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
