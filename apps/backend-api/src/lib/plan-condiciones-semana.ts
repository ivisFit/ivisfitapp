import type { AlimentoCategoria, DiaPlanNutricional } from "@ivisfit/database";
import {
  normalizeAlimentoNombre,
  type CatalogAlimentoMacros,
} from "./alimento-catalog-match.js";
import { isExcludedByEvaluacion } from "./sustitucion-alimento.js";

const PATRON_SIN =
  /\b(?:sin|nada de|no (?:usar|incluir|quiero|comer)|evitar|excluir)\s+([^,.;\n]+)/gi;

/** Tokens de nombre que suelen indicar un alimento prohibido por grupo. */
const TOKENS_POR_GRUPO: Array<{ patron: RegExp; tokens: string[] }> = [
  {
    patron: /\bpescad|marisc|at[uú]n|salm[oó]n|merluza|sardina|caballa|bacalao|trucha\b/i,
    tokens: [
      "pescado",
      "atun",
      "salmon",
      "merluza",
      "sardina",
      "caballa",
      "bacalao",
      "trucha",
      "marisco",
    ],
  },
  {
    patron: /\bl[aá]cteo|l[aá]cteos|queso|yogur|leche|manteca|crema\b/i,
    tokens: ["lacteo", "queso", "yogur", "leche", "manteca", "crema"],
  },
  {
    patron: /\bcerdo|chancho|jam[oó]n|panceta|tocino|bondiola\b/i,
    tokens: ["cerdo", "chancho", "jamon", "panceta", "tocino", "bondiola"],
  },
  {
    patron: /\bhuevo|huevos\b/i,
    tokens: ["huevo", "huevos"],
  },
  {
    patron: /\bpollo|ave|pavo\b/i,
    tokens: ["pollo", "pavo", "ave"],
  },
  {
    patron: /\bres|carne roja|vacuno|ternera\b/i,
    tokens: ["res", "vacuno", "ternera", "carne"],
  },
  {
    patron: /\bgluten|trigo|avena|cebada|centeno\b/i,
    tokens: ["gluten", "trigo", "avena", "cebada", "centeno", "pan"],
  },
];

const CATEGORIAS_POR_GRUPO: Array<{ patron: RegExp; categorias: AlimentoCategoria[] }> =
  [
    {
      patron: /\bl[aá]cteo|l[aá]cteos|queso|yogur|leche\b/i,
      categorias: ["lacteo"],
    },
  ];

export type CondicionesSemanaParseadas = {
  reglas: string[];
  terminosExclusion: string[];
  categoriasExcluidas: AlimentoCategoria[];
};

export function extraerTerminosSin(texto: string): string[] {
  const terminos: string[] = [];
  for (const match of texto.matchAll(PATRON_SIN)) {
    for (const parte of (match[1] ?? "").split(/\s+y\s+|\s+o\s+|\//)) {
      const limpio = normalizeAlimentoNombre(
        parte.replace(/^(el|la|los|las|un|una)\s+/i, ""),
      );
      if (limpio.length >= 3) terminos.push(limpio);
    }
  }
  return terminos;
}

function expandirGruposDesdeTexto(
  texto: string,
  terminos: Set<string>,
  categorias: Set<AlimentoCategoria>,
) {
  const norm = texto.toLowerCase();
  const esProhibicion =
    /\b(sin|nada de|evitar|excluir|no usar|no incluir)\b/i.test(texto) ||
    extraerTerminosSin(texto).length > 0;

  if (!esProhibicion) return;

  for (const grupo of TOKENS_POR_GRUPO) {
    if (grupo.patron.test(norm)) {
      for (const token of grupo.tokens) terminos.add(token);
    }
  }
  for (const grupo of CATEGORIAS_POR_GRUPO) {
    if (grupo.patron.test(norm)) {
      for (const cat of grupo.categorias) categorias.add(cat);
    }
  }
}

export function parseCondicionesSemana(instruccion: string): CondicionesSemanaParseadas {
  const reglas: string[] = [];
  const terminos = new Set<string>();
  const categorias = new Set<AlimentoCategoria>();

  const lineas = instruccion
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  for (const linea of lineas) {
    reglas.push(linea);
    for (const t of extraerTerminosSin(linea)) terminos.add(t);
    expandirGruposDesdeTexto(linea, terminos, categorias);
  }

  for (const t of extraerTerminosSin(instruccion)) terminos.add(t);
  expandirGruposDesdeTexto(instruccion, terminos, categorias);

  return {
    reglas,
    terminosExclusion: Array.from(terminos),
    categoriasExcluidas: Array.from(categorias),
  };
}

export function catalogoItemViolatesCondiciones(
  item: CatalogAlimentoMacros,
  parseadas: CondicionesSemanaParseadas,
  excluirIds: Set<string>,
): boolean {
  const id = String(item._id);
  if (excluirIds.has(id)) return true;
  if (parseadas.categoriasExcluidas.includes(item.categoria as AlimentoCategoria)) {
    return true;
  }
  if (isExcludedByEvaluacion(item.nombre, parseadas.terminosExclusion)) {
    return true;
  }
  return false;
}

export function filtrarCatalogoPorCondicionesSemana(
  catalog: CatalogAlimentoMacros[],
  parseadas: CondicionesSemanaParseadas,
  excluirIds: string[] = [],
): { catalog: CatalogAlimentoMacros[]; excluidos: CatalogAlimentoMacros[] } {
  const ids = new Set(excluirIds.map(String));
  const excluidos: CatalogAlimentoMacros[] = [];
  const permitidos: CatalogAlimentoMacros[] = [];

  for (const item of catalog) {
    if (catalogoItemViolatesCondiciones(item, parseadas, ids)) {
      excluidos.push(item);
    } else {
      permitidos.push(item);
    }
  }

  return { catalog: permitidos, excluidos };
}

export function buildTokensExcluidos(
  parseadas: CondicionesSemanaParseadas,
  excluidos: CatalogAlimentoMacros[],
): string[] {
  return Array.from(
    new Set([
      ...parseadas.terminosExclusion.map((t) => normalizeAlimentoNombre(t)),
      ...excluidos.map((item) => normalizeAlimentoNombre(item.nombre)),
    ]),
  ).filter((t) => t.length >= 2);
}

export function filtrarDiasPlanPorCondiciones(
  dias: DiaPlanNutricional[],
  tokens: string[],
): DiaPlanNutricional[] {
  if (tokens.length === 0) return dias;
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.filter(
        (ing) =>
          !ing.nombre?.trim() || !isExcludedByEvaluacion(ing.nombre, tokens),
      ),
    })),
  }));
}
