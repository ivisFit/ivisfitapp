const WEEKDAY_KEYS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
] as const;

function foldName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function weekdayIndexFromName(nombre: string): number | null {
  const folded = foldName(nombre);
  const index = WEEKDAY_KEYS.findIndex((key) =>
    new RegExp(`(^|[^a-z])${key}([^a-z]|$)`).test(folded),
  );
  return index >= 0 ? index : null;
}

export function planUsesWeekdays(nombres: string[]) {
  if (nombres.length < 2) return false;
  const indexes = nombres.map(weekdayIndexFromName);
  if (indexes.some((index) => index === null)) return false;
  return new Set(indexes).size === indexes.length;
}

export function getTodayDateKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDiaHoyIndex(
  totalDias: number,
  publicadoAt?: string,
  now = new Date(),
) {
  if (totalDias <= 1 || !publicadoAt) return 0;
  const start = new Date(publicadoAt);
  if (Number.isNaN(start.getTime())) return 0;
  start.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const days = Math.max(
    0,
    Math.round((today.getTime() - start.getTime()) / 86400000),
  );
  return days % totalDias;
}

export function resolveDiaHoyIndex(
  dias: Array<{ nombre: string }>,
  publicadoAt?: string,
  now = new Date(),
) {
  if (dias.length === 0) return 0;
  if (planUsesWeekdays(dias.map((dia) => dia.nombre))) {
    const today = now.getDay();
    const index = dias.findIndex(
      (dia) => weekdayIndexFromName(dia.nombre) === today,
    );
    if (index >= 0) return index;
  }
  return getDiaHoyIndex(dias.length, publicadoAt, now);
}
