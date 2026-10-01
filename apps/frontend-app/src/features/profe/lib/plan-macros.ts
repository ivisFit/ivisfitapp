import type {
  ComidaPlan,
  DiaPlanNutricional,
  EstructuraComida,
  IngredientePlan,
  MacrosObjetivo,
} from "@/features/alumna/types/plan-nutricional";

function roundMacro(value: number): number {
  return Math.round(value * 10) / 10;
}

export function sumIngredienteMacros(
  ingredientes: IngredientePlan[],
): MacrosObjetivo {
  return ingredientes.reduce(
    (acc, ingrediente) => ({
      kcal: acc.kcal + (ingrediente.kcal ?? 0),
      proteinaG: roundMacro(acc.proteinaG + (ingrediente.proteinaG ?? 0)),
      carbohidratosG: roundMacro(
        acc.carbohidratosG + (ingrediente.carbohidratosG ?? 0),
      ),
      grasasG: roundMacro(acc.grasasG + (ingrediente.grasasG ?? 0)),
    }),
    { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
  );
}

export function sumComidaMacros(comida: ComidaPlan): MacrosObjetivo {
  const fromIngredientes = sumIngredienteMacros(comida.ingredientes);
  if (fromIngredientes.kcal > 0) return fromIngredientes;
  return comida.macrosComida ?? fromIngredientes;
}

export function sumDiaMacros(dia: DiaPlanNutricional): MacrosObjetivo {
  return dia.comidas.reduce(
    (total, comida) => {
      const comidaTotal = sumComidaMacros(comida);
      return {
        kcal: total.kcal + comidaTotal.kcal,
        proteinaG: roundMacro(total.proteinaG + comidaTotal.proteinaG),
        carbohidratosG: roundMacro(
          total.carbohidratosG + comidaTotal.carbohidratosG,
        ),
        grasasG: roundMacro(total.grasasG + comidaTotal.grasasG),
      };
    },
    { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
  );
}

export function macrosFromPorcentaje(
  daily: MacrosObjetivo,
  porcentajeKcal: number,
): MacrosObjetivo {
  const kcal = Math.round((daily.kcal * porcentajeKcal) / 100);
  const kcalTotal =
    daily.proteinaG * 4 + daily.carbohidratosG * 4 + daily.grasasG * 9;
  if (kcalTotal <= 0) {
    return {
      kcal,
      proteinaG: roundMacro((daily.proteinaG * porcentajeKcal) / 100),
      carbohidratosG: roundMacro((daily.carbohidratosG * porcentajeKcal) / 100),
      grasasG: roundMacro((daily.grasasG * porcentajeKcal) / 100),
    };
  }
  const ratio = kcal / kcalTotal;
  return {
    kcal,
    proteinaG: roundMacro(daily.proteinaG * ratio),
    carbohidratosG: roundMacro(daily.carbohidratosG * ratio),
    grasasG: roundMacro(daily.grasasG * ratio),
  };
}

const DEFAULT_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const MEAL_NAMES = [
  "Desayuno",
  "Almuerzo",
  "Merienda",
  "Cena",
  "Colación",
  "Snack",
];

export function defaultWeekDayNames(): string[] {
  return [...DEFAULT_WEEK];
}

export function buildDefaultEstructura(cantidadComidas: number): EstructuraComida[] {
  const porComida = Math.floor(100 / cantidadComidas);
  const resto = 100 - porComida * cantidadComidas;
  return Array.from({ length: cantidadComidas }, (_, index) => ({
    nombre: MEAL_NAMES[index] ?? `Comida ${index + 1}`,
    horario: "",
    porcentajeKcal: porComida + (index === 0 ? resto : 0),
  }));
}

export function buildEmptyComidaSlot(
  slot: EstructuraComida,
  macrosObjetivo: MacrosObjetivo,
): ComidaPlan {
  return {
    nombre: slot.nombre,
    horario: slot.horario,
    ingredientes: [{ nombre: "", cantidad: 100, unidad: "g" }],
    notas: "",
    preparacion: "",
    macrosObjetivo: macrosFromPorcentaje(macrosObjetivo, slot.porcentajeKcal),
  };
}

export function buildEmptyWeek(
  dayNames: string[],
  estructura: EstructuraComida[],
  macrosObjetivo: MacrosObjetivo,
): DiaPlanNutricional[] {
  const comidasTemplate = estructura.map((slot) =>
    buildEmptyComidaSlot(slot, macrosObjetivo),
  );
  return dayNames.map((nombre) => ({
    nombre,
    comidas: comidasTemplate.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.map((ing) => ({ ...ing })),
    })),
  }));
}

export function planDiasTienenEstructura(dias: DiaPlanNutricional[]) {
  return (
    dias.length > 0 &&
    dias.every((dia) => Array.isArray(dia.comidas) && dia.comidas.length > 0)
  );
}

export function estructuraComidasCambioGrave(
  estructuraAnterior: EstructuraComida[],
  estructuraNueva: EstructuraComida[],
) {
  return estructuraAnterior.length !== estructuraNueva.length;
}

function mergeComidaConSlot(
  comida: ComidaPlan | undefined,
  slot: EstructuraComida,
  macrosObjetivo: MacrosObjetivo,
): ComidaPlan {
  const macrosObjetivoComida = macrosFromPorcentaje(
    macrosObjetivo,
    slot.porcentajeKcal,
  );
  if (!comida) {
    return buildEmptyComidaSlot(slot, macrosObjetivo);
  }
  return applyMacrosComidaToComida({
    ...comida,
    nombre: slot.nombre,
    horario: slot.horario,
    macrosObjetivo: macrosObjetivoComida,
    ingredientes: comida.ingredientes.map((ing) => ({ ...ing })),
  });
}

export function syncDiasConEstructura(
  dias: DiaPlanNutricional[],
  estructura: EstructuraComida[],
  macrosObjetivo: MacrosObjetivo,
): DiaPlanNutricional[] {
  return dias.map((dia) => ({
    ...dia,
    comidas: estructura.map((slot, index) =>
      mergeComidaConSlot(dia.comidas[index], slot, macrosObjetivo),
    ),
  }));
}

export function defaultMealName(index: number): string {
  return MEAL_NAMES[index] ?? `Comida ${index + 1}`;
}

export function diasDesincronizadosConEstructura(
  dias: DiaPlanNutricional[],
  estructuraComidas: EstructuraComida[],
) {
  if (!estructuraComidas.length) return false;
  return dias.some((dia) =>
    dia.comidas.length !== estructuraComidas.length ||
    dia.comidas.some((comida, index) => {
      const slot = estructuraComidas[index];
      if (!slot) return false;
      return (
        comida.nombre !== slot.nombre ||
        (comida.horario ?? "") !== (slot.horario ?? "")
      );
    }),
  );
}

export function planDiasTienenContenido(dias: DiaPlanNutricional[]) {
  return dias.some((dia) =>
    dia.comidas.some(
      (comida) =>
        Boolean(comida.preparacion?.trim()) ||
        Boolean(comida.notas?.trim()) ||
        comida.ingredientes.some(
          (ing) =>
            ing.nombre.trim() !== "" ||
            ing.kcal != null ||
            Boolean(ing.alimentoId),
        ),
    ),
  );
}

export function applyMacrosComidaToComida(comida: ComidaPlan): ComidaPlan {
  const macrosComida = sumComidaMacros(comida);
  if (macrosComida.kcal <= 0) {
    const { macrosComida: _omit, ...rest } = comida;
    return rest;
  }
  return { ...comida, macrosComida };
}

export function applyMacrosComidaToDias(
  dias: DiaPlanNutricional[],
): DiaPlanNutricional[] {
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map(applyMacrosComidaToComida),
  }));
}

/** Quita filas de ingrediente sin nombre (placeholders del editor). */
export function stripEmptyIngredientesFromDias(
  dias: DiaPlanNutricional[],
): DiaPlanNutricional[] {
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.filter((ing) => Boolean(ing.nombre?.trim())),
    })),
  }));
}

export function prepareDiasForPlanApi(dias: DiaPlanNutricional[]): DiaPlanNutricional[] {
  return applyMacrosComidaToDias(stripEmptyIngredientesFromDias(dias));
}
