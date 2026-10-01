import type { PlanNutricionalApiDoc } from "@/features/alumna/types/plan-nutricional";
import type { AlimentacionPlanStep } from "@/routes/paths";
import { planDiasTienenContenido } from "@/features/profe/lib/plan-macros";

export const ALIMENTACION_STEP_LABELS: Record<AlimentacionPlanStep, string> = {
  perfil: "Perfil",
  objetivos: "Objetivos",
  comidas: "Comidas",
  revisar: "Revisar",
};

export const ALIMENTACION_STEP_DESCRIPTIONS: Record<AlimentacionPlanStep, string> = {
  perfil: "Evaluación y alertas",
  objetivos: "Macros y estructura",
  comidas: "Semana día por día",
  revisar: "Checklist y publicar",
};

export function resolveAlimentacionEntryStep(
  plan: PlanNutricionalApiDoc | null,
  hasEvaluacion: boolean,
): AlimentacionPlanStep {
  if (!hasEvaluacion) return "perfil";
  if (!plan) return "objetivos";
  if (!plan.estructuraComidas?.length || !plan.dias?.length) return "objetivos";
  if (!planDiasTienenContenido(plan.dias)) return "comidas";
  return "comidas";
}
