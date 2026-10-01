import {
  Alimento,
  type AlimentoCategoria,
  type ComidaPlan,
  type DiaPlanNutricional,
  type IngredientePlan,
} from "@ivisfit/database";
import {
  normalizeAlimentoNombre,
  type CatalogAlimentoMacros,
} from "./alimento-catalog-match.js";
import {
  buildExclusionTokens,
  findBestAlimentoMatch,
  isExcludedByEvaluacion,
  type EvaluacionSustitucionContext,
} from "./sustitucion-alimento.js";

export type CatalogoPromptItem = {
  id: string;
  nombre: string;
  categoria: AlimentoCategoria | string;
};

const PLACEHOLDER_IA = new Set([
  "proteina magra",
  "proteína magra",
  "carbohidrato",
  "carbohidrato complejo",
  "vegetales",
]);

const CATEGORIAS_COMIDA_DEFAULT: AlimentoCategoria[] = [
  "proteina",
  "carbohidrato",
  "verdura",
];

function defaultCantidad(item: CatalogAlimentoMacros): number {
  const ref = item.porcionReferencia.cantidad;
  return ref > 0 ? ref : 100;
}

function defaultUnidad(item: CatalogAlimentoMacros): IngredientePlan["unidad"] {
  const u = item.porcionReferencia.unidad;
  return u === "ml" || u === "unidad" ? u : "g";
}

export async function loadCatalogoParaPlan(): Promise<CatalogAlimentoMacros[]> {
  const rows = await Alimento.find({ activo: true })
    .select("nombre categoria porcionReferencia macrosPorPorcion")
    .sort({ nombre: 1 })
    .lean();
  return rows as unknown as CatalogAlimentoMacros[];
}

export function filtrarCatalogoPorEvaluacion(
  catalog: CatalogAlimentoMacros[],
  evaluacion?: EvaluacionSustitucionContext,
): CatalogAlimentoMacros[] {
  const tokens = buildExclusionTokens(evaluacion);
  if (tokens.length === 0) return catalog;
  return catalog.filter((item) => !isExcludedByEvaluacion(item.nombre, tokens));
}

export function formatCatalogoParaPrompt(
  catalog: CatalogAlimentoMacros[],
): CatalogoPromptItem[] {
  return catalog.map((item) => ({
    id: String(item._id),
    nombre: item.nombre,
    categoria: item.categoria,
  }));
}

function findById(
  catalog: CatalogAlimentoMacros[],
  alimentoId?: string,
): CatalogAlimentoMacros | undefined {
  if (!alimentoId?.trim()) return undefined;
  return catalog.find((item) => String(item._id) === alimentoId);
}

function pickFromCategoria(
  catalog: CatalogAlimentoMacros[],
  categoria: AlimentoCategoria,
  usedIds: Set<string>,
  seed: number,
): CatalogAlimentoMacros | undefined {
  const pool = catalog.filter(
    (item) => item.categoria === categoria && !usedIds.has(String(item._id)),
  );
  if (pool.length === 0) {
    const fallback = catalog.filter((item) => !usedIds.has(String(item._id)));
    if (fallback.length === 0) return catalog[seed % catalog.length];
    return fallback[seed % fallback.length];
  }
  return pool[seed % pool.length];
}

function inferCategoriasParaIngrediente(
  nombre: string,
  index: number,
): AlimentoCategoria[] {
  const norm = normalizeAlimentoNombre(nombre);
  if (PLACEHOLDER_IA.has(norm)) {
    return CATEGORIAS_COMIDA_DEFAULT;
  }
  if (norm.includes("prote") || norm.includes("huevo") || norm.includes("pollo")) {
    return ["proteina", "legumbre", "lacteo"];
  }
  if (norm.includes("carb") || norm.includes("arroz") || norm.includes("avena")) {
    return ["carbohidrato", "legumbre", "fruta"];
  }
  if (norm.includes("verd") || norm.includes("ensalada")) {
    return ["verdura", "fruta"];
  }
  if (norm.includes("grasa") || norm.includes("aceite") || norm.includes("nuez")) {
    return ["grasa", "otro"];
  }
  const rotated = [
    CATEGORIAS_COMIDA_DEFAULT[index % CATEGORIAS_COMIDA_DEFAULT.length],
    ...CATEGORIAS_COMIDA_DEFAULT.filter(
      (c) => c !== CATEGORIAS_COMIDA_DEFAULT[index % CATEGORIAS_COMIDA_DEFAULT.length],
    ),
  ];
  return rotated;
}

export type ResolverCatalogoContext = {
  catalog: CatalogAlimentoMacros[];
  usedIds: Set<string>;
  seed: number;
};

export function resolverIngredienteAlCatalogo(
  ing: IngredientePlan,
  ctx: ResolverCatalogoContext,
  ingredientIndex: number,
): IngredientePlan {
  const { catalog, usedIds } = ctx;
  if (catalog.length === 0) return ing;

  let match = findById(catalog, ing.alimentoId);
  const nombreTrim = ing.nombre?.trim() ?? "";
  const isPlaceholder = PLACEHOLDER_IA.has(normalizeAlimentoNombre(nombreTrim));

  if (!match && nombreTrim && !isPlaceholder) {
    match = findBestAlimentoMatch(nombreTrim, catalog);
  }

  if (!match) {
    const categorias = inferCategoriasParaIngrediente(nombreTrim, ingredientIndex);
    for (const cat of categorias) {
      match = pickFromCategoria(catalog, cat, usedIds, ctx.seed + ingredientIndex);
      if (match) break;
    }
    if (!match) {
      match = catalog[(ctx.seed + ingredientIndex) % catalog.length];
    }
  }

  const id = String(match._id);
  usedIds.add(id);

  const cantidad =
    typeof ing.cantidad === "number" && ing.cantidad > 0
      ? ing.cantidad
      : defaultCantidad(match);

  return {
    ...ing,
    alimentoId: id,
    nombre: match.nombre,
    cantidad,
    unidad: ing.unidad ?? defaultUnidad(match),
  };
}

export function resolverComidaAlCatalogo(
  comida: ComidaPlan,
  catalog: CatalogAlimentoMacros[],
  seed: number,
): ComidaPlan {
  const usedIds = new Set<string>();
  const ctx: ResolverCatalogoContext = { catalog, usedIds, seed };
  const rawIngredientes =
    comida.ingredientes.length > 0
      ? comida.ingredientes
      : [{ nombre: "", cantidad: 100, unidad: "g" as const }];

  const ingredientes = rawIngredientes.map((ing, index) =>
    resolverIngredienteAlCatalogo(ing, ctx, index),
  );

  return { ...comida, ingredientes };
}

export function resolverDiasAlCatalogo(
  dias: DiaPlanNutricional[],
  catalog: CatalogAlimentoMacros[],
): DiaPlanNutricional[] {
  let seed = 0;
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map((comida) => {
      const resolved = resolverComidaAlCatalogo(comida, catalog, seed);
      seed += 1;
      return resolved;
    }),
  }));
}

export function buildComidaFallbackDesdeCatalogo(
  slot: ComidaPlan,
  catalog: CatalogAlimentoMacros[],
  seed: number,
): ComidaPlan {
  const base: ComidaPlan = {
    ...slot,
    ingredientes: [],
    notas: slot.notas ?? "Ajustá porciones según hambre y energía del día.",
    preparacion:
      slot.preparacion ?? "Preparación simple con alimentos del catálogo.",
  };
  const withSlots = resolverComidaAlCatalogo(
    {
      ...base,
      ingredientes: CATEGORIAS_COMIDA_DEFAULT.map((_, i) => ({
        nombre: CATEGORIAS_COMIDA_DEFAULT[i] ?? "proteina",
        cantidad: 100,
        unidad: "g" as const,
      })),
    },
    catalog,
    seed,
  );
  return { ...withSlots, nombre: slot.nombre, horario: slot.horario, macrosObjetivo: slot.macrosObjetivo };
}
