"use client";

import { useRef } from "react";
import { ArrowRight, UserRound } from "lucide-react";
import { EvaluacionNutricionalResumen } from "@/features/profe/components/EvaluacionNutricionalResumen";
import {
  AlimentacionStepFooter,
  AlimentacionStepHeader,
} from "@/features/profe/components/alimentacion-plan/AlimentacionStepChrome";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import { useAlimentacionStepSave } from "@/features/profe/hooks/useAlimentacionStepSave";
import { profeAlumnaAlimentacionStepRoute } from "@/routes/paths";
import type { EvaluacionBriefingResponse } from "@/features/alumna/types/plan-nutricional";

export function AlimentacionPerfilStep() {
  const { alumnaId, plan, hasUnsavedChanges, setMacrosSugeridos, setMacrosObjetivo } =
    useAlimentacionPlan();
  const { navigateWithSave } = useAlimentacionStepSave();
  const briefingMacrosAppliedRef = useRef(false);

  function handleBriefing(briefing: EvaluacionBriefingResponse) {
    setMacrosSugeridos(briefing.macrosSugeridos);
    const tieneBorradorPersistido = Boolean(plan?._id ?? plan?.id);
    if (tieneBorradorPersistido || hasUnsavedChanges) return;
    if (!briefingMacrosAppliedRef.current) {
      setMacrosObjetivo(briefing.macrosSugeridos);
      briefingMacrosAppliedRef.current = true;
    }
  }

  const objetivosHref = profeAlumnaAlimentacionStepRoute(alumnaId, "objetivos");

  return (
    <div className="alimentacion-plan-step">
      <AlimentacionStepHeader
        icon={<UserRound size={20} />}
        title="Perfil de la alumna"
        description="Revisá la evaluación y el resumen de IA antes de definir objetivos."
      />
      <EvaluacionNutricionalResumen
        alumnaId={alumnaId}
        asPage
        onBriefingLoaded={handleBriefing}
      />
      <AlimentacionStepFooter>
        <button
          type="button"
          className="btn btn--primary ap-footer__cta"
          onClick={() => void navigateWithSave(objetivosHref)}
        >
          <span>Continuar a objetivos</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </AlimentacionStepFooter>
    </div>
  );
}
