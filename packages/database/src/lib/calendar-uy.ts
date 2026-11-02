/**
 * Fechas de rutina/plan en IVIS Fit:
 * - Inicio elegido por la profe (`type="date"` → YYYY-MM-DD): ese día civil exacto, sin correrlo por husos.
 * - "Hoy" e instantes (createdAt, progreso): día civil en America/Montevideo.
 */

export const URUGUAY_TIME_ZONE = "America/Montevideo";

const DATE_KEY_RE = /^(\d{4}-\d{2}-\d{2})$/;

export function isCalendarDateKey(value: string): value is `${number}-${number}-${number}` {
  return DATE_KEY_RE.test(value);
}

/** Día civil que cargó la profe (inicio de rutina/plan). */
export function profeCalendarDateKey(value: unknown): string | null {
  if (value == null || value === "") return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (DATE_KEY_RE.test(trimmed)) return trimmed;
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
    if (match) return match[1];
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof value === "number") {
    return profeCalendarDateKey(new Date(value));
  }

  return null;
}

/** Instantáneo → YYYY-MM-DD en Uruguay (hoy, createdAt, etc.). */
export function instantToUruguayDateKey(
  value: Date | string | null | undefined,
): string | null {
  if (value == null || value === "") return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: URUGUAY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dateKeyToUtcDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

/** Normaliza input de API/formulario al Date que guardamos en Mongo. */
export function normalizeProfeCalendarDateInput(value: unknown): Date | undefined {
  const key = profeCalendarDateKey(value);
  if (!key) return undefined;
  return dateKeyToUtcDate(key);
}

export function addCalendarDays(dateKey: string, days: number): string {
  const date = dateKeyToUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatCalendarDateKeyLongEsUy(dateKey: string): string {
  const match = DATE_KEY_RE.exec(dateKey);
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
