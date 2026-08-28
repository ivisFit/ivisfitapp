export type HistorialCategoria =
  | "admision"
  | "rutina"
  | "peso"
  | "medicion"
  | "alimentacion"
  | "gamificacion";

export type AlumnaHistorialEvent = {
  id: string;
  categoria: HistorialCategoria;
  tipo: string;
  titulo: string;
  detalle: string;
  ocurrioEn: string | null;
};

export type AlumnaHistorialFilters = {
  categoria?: HistorialCategoria;
  desde?: string;
  hasta?: string;
  q?: string;
};

export const HISTORIAL_CATEGORIA_OPTIONS: Array<{
  value: HistorialCategoria | "";
  label: string;
}> = [
  { value: "", label: "Todas las categorías" },
  { value: "admision", label: "Admisión" },
  { value: "rutina", label: "Rutina" },
  { value: "peso", label: "Peso" },
  { value: "medicion", label: "Mediciones" },
  { value: "alimentacion", label: "Alimentación" },
  { value: "gamificacion", label: "Gamificación" },
];

export const HISTORIAL_CATEGORIA_LABELS: Record<HistorialCategoria, string> = {
  admision: "Admisión",
  rutina: "Rutina",
  peso: "Peso",
  medicion: "Mediciones",
  alimentacion: "Alimentación",
  gamificacion: "Gamificación",
};

export const EMPTY_HISTORIAL_FILTERS: AlumnaHistorialFilters = {};

export function hasActiveHistorialFilters(filters: AlumnaHistorialFilters) {
  return Boolean(
    filters.categoria || filters.desde || filters.hasta || filters.q?.trim(),
  );
}

export function sortHistorialEvents(events: AlumnaHistorialEvent[]) {
  return [...events].sort((a, b) => {
    if (!a.ocurrioEn && !b.ocurrioEn) return 0;
    if (!a.ocurrioEn) return 1;
    if (!b.ocurrioEn) return -1;
    return new Date(b.ocurrioEn).getTime() - new Date(a.ocurrioEn).getTime();
  });
}

export function formatHistorialDate(value: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
