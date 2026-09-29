import type { AlimentoCategoria } from "@ivisfit/database";
import {
  calcularGramosEquivalentesPorKcal,
  findAlimentoMatch,
  normalizeAlimentoNombre,
  type CatalogAlimentoMacros,
} from "./alimento-catalog-match.js";

export type AlternativaSustitucion = {
  nombre: string;
  gramos: number;
  categoria: AlimentoCategoria | string;
  kcalAprox: number;
};

export type EvaluacionSustitucionContext = {
  alergias?: string[];
  alimentosEvitados?: string[];
  restricciones?: string[];
};

export type PlanSustitucionContext = {
  dias?: {
    comidas: { ingredientes: { nombre: string }[] }[];
  }[];
};

const MAX_ALTERNATIVAS = 4;

function kcalEnGramos(item: CatalogAlimentoMacros, gramos: number): number {
  const porcion = item.porcionReferencia.cantidad;
  if (porcion <= 0) return 0;
  const factor = gramos / porcion;
  return Math.round(item.macrosPorPorcion.kcal * factor);
}

function findBestAlimentoMatch(
  nombre: string,
  catalog: CatalogAlimentoMacros[],
): CatalogAlimentoMacros | undefined {
  const exact = findAlimentoMatch(nombre, catalog);
  if (exact) return exact;

  const normalized = normalizeAlimentoNombre(nombre);
  if (!normalized) return undefined;

  const partial = catalog
    .map((item) => {
      const itemNorm = normalizeAlimentoNombre(item.nombre);
      const includes =
        itemNorm.includes(normalized) || normalized.includes(itemNorm);
      if (!includes) return null;
      return {
        item,
        score: Math.abs(itemNorm.length - normalized.length),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.score - b.score);

  return partial[0]?.item;
}

function resolveOrigenEnCatalogo(
  alimento: string,
  catalogo: CatalogAlimentoMacros[],
  plan?: PlanSustitucionContext,
): CatalogAlimentoMacros | undefined {
  let origen = findBestAlimentoMatch(alimento, catalogo);
  if (origen) return origen;

  const nombresPlan: string[] = [];
  for (const dia of plan?.dias ?? []) {
    for (const comida of dia.comidas) {
      for (const ing of comida.ingredientes) {
        if (ing.nombre.trim()) nombresPlan.push(ing.nombre.trim());
      }
    }
  }

  const alimentoNorm = normalizeAlimentoNombre(alimento);
  for (const nombrePlan of nombresPlan) {
    const planNorm = normalizeAlimentoNombre(nombrePlan);
    if (
      planNorm.includes(alimentoNorm) ||
      alimentoNorm.includes(planNorm)
    ) {
      origen = findBestAlimentoMatch(nombrePlan, catalogo);
      if (origen) return origen;
    }
  }

  return findBestAlimentoMatch(alimento, catalogo);
}

function buildExclusionTokens(
  evaluacion?: EvaluacionSustitucionContext,
): string[] {
  const tokens: string[] = [];
  for (const list of [
    evaluacion?.alergias,
    evaluacion?.alimentosEvitados,
    evaluacion?.restricciones,
  ]) {
    for (const entry of list ?? []) {
      const norm = normalizeAlimentoNombre(entry);
      if (norm) tokens.push(norm);
    }
  }
  return tokens;
}

function isExcludedByEvaluacion(
  nombre: string,
  exclusionTokens: string[],
): boolean {
  if (exclusionTokens.length === 0) return false;
  const norm = normalizeAlimentoNombre(nombre);
  return exclusionTokens.some(
    (token) => norm.includes(token) || token.includes(norm),
  );
}

function promedioKcalPor100g(
  catalogo: CatalogAlimentoMacros[],
  categoria: AlimentoCategoria,
): number {
  const items = catalogo.filter((item) => item.categoria === categoria);
  if (items.length === 0) return 120;
  const sum = items.reduce((acc, item) => {
    const porcion = item.porcionReferencia.cantidad || 100;
    return acc + (item.macrosPorPorcion.kcal / porcion) * 100;
  }, 0);
  return sum / items.length;
}

function inferCategoriaDefault(
  alimento: string,
  catalogo: CatalogAlimentoMacros[],
): AlimentoCategoria {
  const partial = findBestAlimentoMatch(alimento, catalogo);
  if (partial) return partial.categoria;

  const norm = normalizeAlimentoNombre(alimento);
  const proteinHints = [
    "pollo",
    "carne",
    "pescado",
    "merluza",
    "atun",
    "huevo",
    "proteina",
  ];
  if (proteinHints.some((hint) => norm.includes(hint))) return "proteina";

  const carbHints = ["arroz", "avena", "pan", "papa", "batata", "pasta"];
  if (carbHints.some((hint) => norm.includes(hint))) return "carbohidrato";

  return "proteina";
}

function rankAlternativas(
  catalogo: CatalogAlimentoMacros[],
  origen: CatalogAlimentoMacros | undefined,
  gramos: number,
  categoriaPreferida: AlimentoCategoria,
  exclusionTokens: string[],
): AlternativaSustitucion[] {
  const targetKcal = origen
    ? kcalEnGramos(origen, gramos)
    : Math.round((promedioKcalPor100g(catalogo, categoriaPreferida) * gramos) / 100);

  const origenId = origen ? String(origen._id) : null;

  const scored = catalogo
    .filter((item) => {
      if (origenId && String(item._id) === origenId) return false;
      if (isExcludedByEvaluacion(item.nombre, exclusionTokens)) return false;
      if (item.porcionReferencia.unidad !== "g" && item.porcionReferencia.unidad !== "ml") {
        return item.porcionReferencia.unidad === "unidad";
      }
      return true;
    })
    .map((destino) => {
      const gramosEq = origen
        ? calcularGramosEquivalentesPorKcal(origen, destino, gramos)
        : gramos;
      const kcalAprox = kcalEnGramos(destino, gramosEq);
      const categoriaPenalty = destino.categoria === categoriaPreferida ? 0 : 350;
      const kcalDelta = Math.abs(kcalAprox - targetKcal);
      return {
        destino,
        gramosEq,
        kcalAprox,
        score: categoriaPenalty + kcalDelta,
      };
    })
    .sort((a, b) => a.score - b.score);

  const seen = new Set<string>();
  const result: AlternativaSustitucion[] = [];

  for (const entry of scored) {
    const key = normalizeAlimentoNombre(entry.destino.nombre);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      nombre: entry.destino.nombre,
      gramos: entry.gramosEq,
      categoria: entry.destino.categoria,
      kcalAprox: entry.kcalAprox,
    });
    if (result.length >= MAX_ALTERNATIVAS) break;
  }

  return result;
}

export function alimentoApareceEnPlan(
  alimento: string,
  plan?: PlanSustitucionContext,
): boolean {
  const norm = normalizeAlimentoNombre(alimento);
  if (!norm) return false;
  for (const dia of plan?.dias ?? []) {
    for (const comida of dia.comidas) {
      for (const ing of comida.ingredientes) {
        const ingNorm = normalizeAlimentoNombre(ing.nombre);
        if (ingNorm.includes(norm) || norm.includes(ingNorm)) return true;
      }
    }
  }
  return false;
}

export function buildAlternativasSustitucion(input: {
  alimento: string;
  gramos: number;
  catalogo: CatalogAlimentoMacros[];
  evaluacion?: EvaluacionSustitucionContext;
  plan?: PlanSustitucionContext;
}): AlternativaSustitucion[] {
  const { alimento, gramos, catalogo, evaluacion, plan } = input;
  if (catalogo.length === 0) return [];

  const exclusionTokens = buildExclusionTokens(evaluacion);
  const origen = resolveOrigenEnCatalogo(alimento, catalogo, plan);
  const categoriaPreferida =
    origen?.categoria ?? inferCategoriaDefault(alimento, catalogo);

  let alternativas = rankAlternativas(
    catalogo,
    origen,
    gramos,
    categoriaPreferida,
    exclusionTokens,
  );

  if (alternativas.length === 0) {
    alternativas = rankAlternativas(
      catalogo,
      origen,
      gramos,
      categoriaPreferida,
      [],
    );
  }

  return alternativas;
}

export function formatSustitucionReply(
  alimento: string,
  gramos: number,
  alternativas: AlternativaSustitucion[],
  extras?: { enPlan?: boolean },
): string {
  if (alternativas.length === 0) {
    return mensajeCatalogoVacio();
  }

  const intro = extras?.enPlan
    ? `Para reemplazar ${gramos} g de ${alimento} (está en tu plan), podés usar estas opciones con energía similar:`
    : `Para reemplazar ${gramos} g de ${alimento}, podés usar estas opciones con energía similar:`;

  const lineas = alternativas
    .map(
      (item) =>
        `• ${item.nombre}: ~${item.gramos} g (~${item.kcalAprox} kcal)`,
    )
    .join("\n");

  return `${intro}\n\n${lineas}\n\nRespetá tu plan del día y las porciones que te indicó Ivis.`;
}

export function mensajeCatalogoVacio(): string {
  return (
    "Todavía no hay alimentos cargados en el catálogo, así que no puedo calcular equivalencias. " +
    "Tu profe puede cargarlos en Catálogo → Alimentos."
  );
}

export function responseIncludesAlternativas(
  reply: string,
  alternativas: AlternativaSustitucion[],
): boolean {
  const normalizedReply = normalizeAlimentoNombre(reply);
  let hits = 0;
  for (const alt of alternativas.slice(0, MAX_ALTERNATIVAS)) {
    const name = normalizeAlimentoNombre(alt.nombre);
    if (name && normalizedReply.includes(name)) hits += 1;
  }
  return hits >= 2;
}

export function toSugerenciasCatalogo(alternativas: AlternativaSustitucion[]) {
  return alternativas.map((item) => ({
    nombre: item.nombre,
    gramos: item.gramos,
    categoria: String(item.categoria),
  }));
}
