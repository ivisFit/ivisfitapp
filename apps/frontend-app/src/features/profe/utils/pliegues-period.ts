import {
  resolveMetodoCalculo,
  type Medicion,
  type MetodoCalculo,
} from "@/features/profe/types/medicion";
import type { Sexo } from "@/types/usuario";

export type { MetodoCalculo };

export type PlieguesPeriod = "7d" | "30d" | "90d" | "180d" | "365d" | "all";

export const PLIEGUES_PERIOD_OPTIONS: Array<{
  id: PlieguesPeriod;
  label: string;
}> = [
  { id: "7d", label: "7 días" },
  { id: "30d", label: "30 días" },
  { id: "90d", label: "3 meses" },
  { id: "180d", label: "6 meses" },
  { id: "365d", label: "1 año" },
  { id: "all", label: "Todo" },
];

export const METODO_CALCULO_OPTIONS: Array<{
  id: MetodoCalculo;
  label: string;
  description: string;
}> = [
  {
    id: "jp3",
    label: "3 pliegues",
    description:
      "Jackson-Pollock de 3 sitios. Rápido y práctico; los sitios varían según el sexo.",
  },
  {
    id: "jp7",
    label: "7 pliegues",
    description:
      "Jackson-Pollock de 7 sitios. Mayor precisión al evaluar más zonas del tejido adiposo.",
  },
  {
    id: "us-navy",
    label: "Circunferencias",
    description:
      "Fórmula US Navy con cinta métrica (cm). Los valores se convierten internamente para el cálculo.",
  },
];

const PERIOD_DAYS: Record<Exclude<PlieguesPeriod, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
};

const JP7_FIELDS = [
  "pectoral",
  "axilarMedia",
  "tricipital",
  "subescapular",
  "abdominal",
  "suprailiaco",
  "muslo",
] as const;

export function getPeriodStartDate(
  period: PlieguesPeriod,
  referenceDate = new Date(),
) {
  if (period === "all") {
    return null;
  }

  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - PERIOD_DAYS[period]);
  return start;
}

export function filterMedicionesByPeriod(
  mediciones: Medicion[],
  period: PlieguesPeriod,
  referenceDate = new Date(),
) {
  const start = getPeriodStartDate(period, referenceDate);
  const sorted = [...mediciones].sort(
    (a, b) => a.fecha.getTime() - b.fecha.getTime(),
  );
  if (!start) {
    return sorted;
  }
  return sorted.filter((medicion) => medicion.fecha >= start);
}

export function filterMedicionesByMetodo(
  mediciones: Medicion[],
  metodo: MetodoCalculo,
) {
  return mediciones.filter(
    (medicion) => resolveMetodoCalculo(medicion.metodoCalculo) === metodo,
  );
}

export function sumPlieguesJP3(
  sexo: Sexo,
  pliegues: NonNullable<Medicion["pliegues"]>,
) {
  if (sexo === "mujer") {
    return (
      (pliegues.tricipital ?? 0) +
      (pliegues.suprailiaco ?? 0) +
      (pliegues.muslo ?? 0)
    );
  }
  return (
    (pliegues.pectoral ?? 0) +
    (pliegues.abdominal ?? 0) +
    (pliegues.muslo ?? 0)
  );
}

/** @deprecated Use sumPlieguesJP3 */
export function sumPliegues(
  sexo: Sexo,
  pliegues: NonNullable<Medicion["pliegues"]>,
) {
  return sumPlieguesJP3(sexo, pliegues);
}

export function sumPlieguesJP7(pliegues: NonNullable<Medicion["pliegues"]>) {
  return JP7_FIELDS.reduce((sum, field) => sum + (pliegues[field] ?? 0), 0);
}

export function sumMedicionValues(
  metodo: MetodoCalculo,
  sexo: Sexo,
  medicion: Medicion,
) {
  if (metodo === "us-navy") {
    const c = medicion.circunferencias;
    if (!c) return 0;
    if (sexo === "mujer") {
      return (c.cuelloCm ?? 0) + (c.cinturaCm ?? 0) + (c.caderaCm ?? 0);
    }
    return (c.cuelloCm ?? 0) + (c.cinturaCm ?? 0);
  }
  if (metodo === "jp7") {
    return sumPlieguesJP7(medicion.pliegues ?? {});
  }
  return sumPlieguesJP3(sexo, medicion.pliegues ?? {});
}

export function formatSexoLabel(sexo: Sexo) {
  return sexo === "hombre" ? "Hombre" : "Mujer";
}

export function formatMetodoCalculoLabel(metodo: MetodoCalculo) {
  return (
    METODO_CALCULO_OPTIONS.find((option) => option.id === metodo)?.label ??
    metodo
  );
}

export function formatMedicionDate(date: Date) {
  return date.toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMedicionDateShort(date: Date) {
  return date.toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "short",
  });
}

export function formatGrasaCorporal(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toLocaleString("es-UY", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function getMetodoDescription(metodo: MetodoCalculo) {
  return (
    METODO_CALCULO_OPTIONS.find((option) => option.id === metodo)?.description ??
    ""
  );
}
