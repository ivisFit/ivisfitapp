import type { AlimentoCategoria } from "@ivisfit/database";

export function normalizeAlimentoNombre(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findAlimentoMatch<T extends { _id: unknown; nombre: string }>(
  nombre: string,
  catalog: T[],
): T | undefined {
  const normalized = normalizeAlimentoNombre(nombre);
  if (!normalized) return undefined;

  const exact = catalog.find(
    (item) => normalizeAlimentoNombre(item.nombre) === normalized,
  );
  if (exact) return exact;

  const contains = catalog.filter((item) => {
    const itemNorm = normalizeAlimentoNombre(item.nombre);
    return itemNorm.includes(normalized) || normalized.includes(itemNorm);
  });
  if (contains.length === 1) return contains[0];
  return undefined;
}

export type CatalogAlimentoMacros = {
  _id: unknown;
  nombre: string;
  categoria: AlimentoCategoria;
  porcionReferencia: { cantidad: number; unidad: string };
  macrosPorPorcion: {
    kcal: number;
    proteinaG: number;
    carbohidratosG: number;
    grasasG: number;
  };
};

export function calcularGramosEquivalentesPorKcal(
  origen: CatalogAlimentoMacros,
  destino: CatalogAlimentoMacros,
  gramosOrigen: number,
): number {
  const kcalOrigen =
    (origen.macrosPorPorcion.kcal / origen.porcionReferencia.cantidad) *
    gramosOrigen;
  const kcalPorGramoDestino =
    destino.macrosPorPorcion.kcal / destino.porcionReferencia.cantidad;
  if (kcalPorGramoDestino <= 0) return gramosOrigen;
  return Math.round((kcalOrigen / kcalPorGramoDestino) * 10) / 10;
}
