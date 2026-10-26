import type { DiaPlanNutricional, IngredientePlan } from "@ivisfit/database";
import { normalizeAlimentoNombre } from "./alimento-catalog-match.js";

export type MacrosSimples = {
  kcal: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
};

export type AlimentoPorcion = {
  nombre: string;
  categoria?: string;
  porcionReferencia: { cantidad: number; unidad: string };
  macrosPorPorcion: MacrosSimples;
};

type UnidadMedida = IngredientePlan["unidad"];

/** Tope de porciones por ingrediente. Por encima de esto el valor ya no es una porción real. */
const MAX_PORCIONES_DEFAULT = 8;

/**
 * Si la IA manda más unidades que esto, casi seguro copió gramos (150 "unidades" de banana).
 * El corte queda por encima de una porción generosa de piezas y por debajo de los gramajes típicos (50+).
 */
const UNIDADES_QUE_SON_GRAMOS = 40;

/** Por debajo de este gramaje, un "2 g" de un alimento por unidad suele ser "2 unidades". */
const GRAMOS_QUE_SON_UNIDADES = 12;

export type AlinearPorcionOptions = {
  /** Tope de porciones de referencia. Si no se indica, se usa un techo de seguridad. */
  maxPorciones?: number;
};

function roundMacro(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizarUnidad(unidad: string | undefined): UnidadMedida {
  if (unidad === "ml" || unidad === "unidad") return unidad;
  return "g";
}

function unidadesCompatibles(a: UnidadMedida, b: UnidadMedida): boolean {
  if (a === b) return true;
  return a !== "unidad" && b !== "unidad";
}

/** Peso aproximado de 1 pieza, para traducir gramos de la IA a unidades del catálogo. */
function gramosPorUnidad(nombre: string): number {
  const n = normalizeAlimentoNombre(nombre);
  if (/\byema\b/.test(n)) return 18;
  if (/\bhuevo|clara\b/.test(n)) return 50;
  if (/\bgalleta|tostada|oblea\b/.test(n)) return 10;
  if (/\btortilla\b/.test(n)) return 30;
  if (/\bwrap\b/.test(n)) return 60;
  if (/\bmedialuna|pita|hamburguesa|milanesa|barrita|alfajor\b/.test(n)) return 70;
  if (/\bmandarina|kiwi|ciruela|higo|durazno|maracuya\b/.test(n)) return 80;
  if (/\bbanana|platano|manzana|pera|naranja|mango|pomelo|granada\b/.test(n)) return 130;
  return 100;
}

function redondearPaso(valor: number, paso: number): number {
  const redondeado = Math.round(valor / paso) * paso;
  return Math.round(redondeado * 10) / 10;
}

/**
 * Deja cantidad y unidad en la misma escala que la porción de referencia.
 * Evita tratar 150 g de un alimento "1 unidad" como 150 piezas.
 */
export function alinearCantidadConPorcion(
  input: { cantidad: number; unidad?: string; nombre?: string },
  alimento: AlimentoPorcion,
  options?: AlinearPorcionOptions,
): { cantidad: number; unidad: UnidadMedida } {
  const porcionUnidad = normalizarUnidad(alimento.porcionReferencia.unidad);
  const porcionCantidad =
    alimento.porcionReferencia.cantidad > 0 ? alimento.porcionReferencia.cantidad : 1;
  const unidad = normalizarUnidad(input.unidad);
  const cantidad = input.cantidad > 0 ? input.cantidad : porcionCantidad;
  const nombre = alimento.nombre || input.nombre || "";

  let tope = options?.maxPorciones ?? MAX_PORCIONES_DEFAULT;
  if (options?.maxPorciones != null && alimento.categoria === "condimento") {
    tope = Math.min(tope, 2);
  }

  if (porcionUnidad === "unidad") {
    const pareceGramos =
      unidad === "unidad" ? cantidad > UNIDADES_QUE_SON_GRAMOS : cantidad > GRAMOS_QUE_SON_UNIDADES;
    const unidades = pareceGramos ? cantidad / gramosPorUnidad(nombre) : cantidad;
    const maxUnidades = Math.max(porcionCantidad, tope * porcionCantidad);
    const medida = clamp(redondearPaso(unidades, 0.5), 0.5, maxUnidades);
    return { cantidad: medida, unidad: "unidad" };
  }

  // "2 unidades" de un alimento en gramos = 2 porciones. "150 unidades" es un gramaje mal etiquetado.
  const medidaBase = unidadesCompatibles(unidad, porcionUnidad)
    ? cantidad
    : cantidad > GRAMOS_QUE_SON_UNIDADES
      ? cantidad
      : cantidad * porcionCantidad;
  const maxMedida = porcionCantidad * tope;
  const medida = clamp(Math.round(medidaBase), 1, Math.max(1, Math.round(maxMedida)));
  return { cantidad: medida, unidad: porcionUnidad };
}

function macrosDeCantidad(alimento: AlimentoPorcion, cantidad: number): MacrosSimples {
  const porcion =
    alimento.porcionReferencia.cantidad > 0 ? alimento.porcionReferencia.cantidad : 1;
  const factor = cantidad / porcion;
  return {
    kcal: Math.round(alimento.macrosPorPorcion.kcal * factor),
    proteinaG: roundMacro(alimento.macrosPorPorcion.proteinaG * factor),
    carbohidratosG: roundMacro(alimento.macrosPorPorcion.carbohidratosG * factor),
    grasasG: roundMacro(alimento.macrosPorPorcion.grasasG * factor),
  };
}

function aplicarAlimento(
  ingrediente: IngredientePlan,
  alimento: AlimentoPorcion | undefined,
  options?: AlinearPorcionOptions,
): IngredientePlan {
  if (!alimento) return ingrediente;
  const alineado = alinearCantidadConPorcion(ingrediente, alimento, options);
  return {
    ...ingrediente,
    cantidad: alineado.cantidad,
    unidad: alineado.unidad,
    ...macrosDeCantidad(alimento, alineado.cantidad),
  };
}

function sumarDia(dia: DiaPlanNutricional): MacrosSimples {
  return dia.comidas.reduce(
    (total, comida) => {
      for (const ingrediente of comida.ingredientes) {
        total.kcal += ingrediente.kcal ?? 0;
        total.proteinaG = roundMacro(total.proteinaG + (ingrediente.proteinaG ?? 0));
        total.carbohidratosG = roundMacro(
          total.carbohidratosG + (ingrediente.carbohidratosG ?? 0),
        );
        total.grasasG = roundMacro(total.grasasG + (ingrediente.grasasG ?? 0));
      }
      return total;
    },
    { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
  );
}

function conMacrosDeComida(dia: DiaPlanNutricional): DiaPlanNutricional {
  return {
    ...dia,
    comidas: dia.comidas.map((comida) => {
      const macros = comida.ingredientes.reduce(
        (total, ingrediente) => ({
          kcal: total.kcal + (ingrediente.kcal ?? 0),
          proteinaG: roundMacro(total.proteinaG + (ingrediente.proteinaG ?? 0)),
          carbohidratosG: roundMacro(
            total.carbohidratosG + (ingrediente.carbohidratosG ?? 0),
          ),
          grasasG: roundMacro(total.grasasG + (ingrediente.grasasG ?? 0)),
        }),
        { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
      );
      if (macros.kcal <= 0 && comida.ingredientes.every((ing) => ing.kcal == null)) {
        const { macrosComida: _omit, ...rest } = comida;
        return rest;
      }
      return { ...comida, macrosComida: macros };
    }),
  };
}

export function recalcularDiaConCatalogo(
  dia: DiaPlanNutricional,
  alimentos: Map<string, AlimentoPorcion>,
  options?: AlinearPorcionOptions,
): DiaPlanNutricional {
  const recalculado: DiaPlanNutricional = {
    ...dia,
    comidas: dia.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.map((ingrediente) => {
        const alimento = ingrediente.alimentoId
          ? alimentos.get(String(ingrediente.alimentoId))
          : undefined;
        return aplicarAlimento(ingrediente, alimento, options);
      }),
    })),
  };
  return conMacrosDeComida(recalculado);
}

function diaDesproporcionado(actual: MacrosSimples, objetivo: MacrosSimples): boolean {
  if (objetivo.kcal <= 0 || actual.kcal <= 0) return false;
  const ratioKcal = actual.kcal / objetivo.kcal;
  const ratioProteina =
    objetivo.proteinaG > 0 ? actual.proteinaG / objetivo.proteinaG : 1;
  return ratioKcal > 1.22 || ratioKcal < 0.78 || ratioProteina > 1.45 || ratioProteina < 0.6;
}

function factorDeAjuste(actual: MacrosSimples, objetivo: MacrosSimples): number {
  const ratioKcal = actual.kcal / objetivo.kcal;
  const kcalEnBanda = ratioKcal <= 1.22 && ratioKcal >= 0.78;
  const base =
    kcalEnBanda && objetivo.proteinaG > 0 && actual.proteinaG > 0
      ? objetivo.proteinaG / actual.proteinaG
      : objetivo.kcal / actual.kcal;
  return clamp(base, 0.2, 1.8);
}

/**
 * Recalcula macros con la porción real del catálogo y, si el día se fue
 * muy por arriba o por abajo del objetivo, escala las cantidades.
 */
export function ajustarDiaAObjetivo(
  dia: DiaPlanNutricional,
  alimentos: Map<string, AlimentoPorcion>,
  objetivo: MacrosSimples,
  options?: AlinearPorcionOptions,
): DiaPlanNutricional {
  const alineado = recalcularDiaConCatalogo(dia, alimentos, options);
  const actual = sumarDia(alineado);
  if (!diaDesproporcionado(actual, objetivo)) return alineado;

  const factor = factorDeAjuste(actual, objetivo);
  const escalado: DiaPlanNutricional = {
    ...alineado,
    comidas: alineado.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.map((ingrediente) => {
        if (!ingrediente.alimentoId || !(ingrediente.cantidad > 0)) return ingrediente;
        return {
          ...ingrediente,
          cantidad: ingrediente.cantidad * factor,
        };
      }),
    })),
  };
  return recalcularDiaConCatalogo(escalado, alimentos, options);
}
