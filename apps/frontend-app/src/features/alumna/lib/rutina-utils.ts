type RutinaPickCandidate = {
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
};

export function toTime(value?: string): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function rutinaActivityTime(rutina: RutinaPickCandidate): number {
  return toTime(rutina.updatedAt ?? rutina.createdAt ?? rutina.startDate);
}

export function pickPrimaryRutina<T extends RutinaPickCandidate>(
  rutinas: T[],
): T | null {
  if (rutinas.length === 0) return null;
  return [...rutinas].sort(
    (a, b) => rutinaActivityTime(b) - rutinaActivityTime(a),
  )[0];
}
