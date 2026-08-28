import type { CreateEvaluacionNutricionalInput } from "../schemas/evaluacion-nutricional.schema.js";
import type { MacrosObjetivo } from "../schemas/plan-nutricional.schema.js";

const ACTIVITY_MULTIPLIERS = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muy_intenso: 1.9,
} as const;

const OBJETIVO_ADJUSTMENTS = {
  bajar_grasa: -0.15,
  ganar_masa: 0.1,
  recomposicion: -0.05,
  mantener: 0,
  rendimiento: 0.05,
  salud: 0,
} as const;

export function calculateBmrMifflin(
  sexo: "hombre" | "mujer",
  pesoKg: number,
  estaturaCm: number,
  edad: number,
): number {
  const base = 10 * pesoKg + 6.25 * estaturaCm - 5 * edad;
  return sexo === "hombre" ? base + 5 : base - 161;
}

export function calculateTdee(
  evaluacion: Pick<
    CreateEvaluacionNutricionalInput,
    "sexo" | "pesoActualKg" | "estaturaCm" | "edad" | "nivelActividad" | "objetivo"
  >,
): number {
  const bmr = calculateBmrMifflin(
    evaluacion.sexo,
    evaluacion.pesoActualKg,
    evaluacion.estaturaCm,
    evaluacion.edad,
  );
  const multiplier = ACTIVITY_MULTIPLIERS[evaluacion.nivelActividad];
  const adjustment = OBJETIVO_ADJUSTMENTS[evaluacion.objetivo];
  return Math.round(bmr * multiplier * (1 + adjustment));
}

export function calculateMacrosFromKcal(
  kcal: number,
  objetivo: CreateEvaluacionNutricionalInput["objetivo"],
): MacrosObjetivo {
  const ratios = {
    bajar_grasa: { p: 0.3, c: 0.35, g: 0.35 },
    ganar_masa: { p: 0.3, c: 0.45, g: 0.25 },
    recomposicion: { p: 0.32, c: 0.38, g: 0.3 },
    mantener: { p: 0.25, c: 0.45, g: 0.3 },
    rendimiento: { p: 0.25, c: 0.5, g: 0.25 },
    salud: { p: 0.25, c: 0.45, g: 0.3 },
  }[objetivo];

  return {
    kcal,
    proteinaG: Math.round((kcal * ratios.p) / 4),
    carbohidratosG: Math.round((kcal * ratios.c) / 4),
    grasasG: Math.round((kcal * ratios.g) / 9),
  };
}

export function calculateMacrosObjetivo(
  evaluacion: Pick<
    CreateEvaluacionNutricionalInput,
    | "sexo"
    | "pesoActualKg"
    | "estaturaCm"
    | "edad"
    | "nivelActividad"
    | "objetivo"
  >,
): MacrosObjetivo {
  const kcal = calculateTdee(evaluacion);
  return calculateMacrosFromKcal(kcal, evaluacion.objetivo);
}
