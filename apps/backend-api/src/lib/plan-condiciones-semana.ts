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

const DIAS_SEMANA = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
] as const;

const PIDE_IGUALES =
  /\b(dias iguales|menus iguales|menu igual|mismo menu|mismos menus|menu unico|repetir el mismo|repetir los mismos|todos iguales|armar igual|copiar el dia|un solo menu|iguales)\b/;

const PIDE_VARIAR =
  /\b(variar|varia|varien|no repetir|menus distintos|comidas distintas|comidas diferentes)\b/;

export type PlanArmadoSemana = {
  /** Un día base se copia al resto de la semana. */
  repetirBase: boolean;
  /** Claves sin acento (martes, sabado) que deben armarse distintas del resto. */
  diasVariar: string[];
};

export function claveDiaSemana(nombre: string): string | null {
  const normalizado = normalizeAlimentoNombre(nombre);
  return DIAS_SEMANA.find((clave) => normalizado.includes(clave)) ?? null;
}

/** Cómo repartir la semana según lo que escribió la profesional. */
export function planDeArmadoSemana(
  texto: string | undefined,
  nombresDias: string[],
): PlanArmadoSemana {
  const vacio: PlanArmadoSemana = { repetirBase: false, diasVariar: [] };
  const normalizado = normalizeAlimentoNombre(texto ?? "");
  if (!normalizado) return vacio;

  const pideIguales = PIDE_IGUALES.test(normalizado);
  const pideVariar = PIDE_VARIAR.test(normalizado);
  const clavesDelPlan = new Set(
    nombresDias
      .map((nombre) => claveDiaSemana(nombre))
      .filter((clave): clave is string => Boolean(clave)),
  );
  const diasMencionados = DIAS_SEMANA.filter(
    (clave) =>
      normalizado.includes(clave) &&
      (clavesDelPlan.size === 0 || clavesDelPlan.has(clave)),
  );

  if (pideIguales) {
    return { repetirBase: true, diasVariar: pideVariar ? diasMencionados : [] };
  }
  if (
    pideVariar &&
    diasMencionados.length > 0 &&
    diasMencionados.length < nombresDias.length
  ) {
    return { repetirBase: true, diasVariar: diasMencionados };
  }
  return vacio;
}

/** Reglas de “iguales / variar tales días”: se aplican al armar la semana, no al auditar un día suelto. */
export function esReglaDeArmado(texto: string): boolean {
  if (planDeArmadoSemana(texto, [...DIAS_SEMANA]).repetirBase) return true;
  const normalizado = normalizeAlimentoNombre(texto);
  const mencionaDia = DIAS_SEMANA.some((dia) => normalizado.includes(dia));
  const hablaDeEstructura =
    /\biguales?\b|\bvari|\brepet|\bdistint|\bdiferent|\bmismo menu|\bmismos menus\b/.test(
      normalizado,
    );
  return mencionaDia && hablaDeEstructura;
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
