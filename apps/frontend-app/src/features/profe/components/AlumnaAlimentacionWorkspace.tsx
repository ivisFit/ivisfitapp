"use client";

import { useState } from "react";
import { EvaluacionNutricionalResumen } from "@/features/profe/components/EvaluacionNutricionalResumen";
import { PlanNutricionalBuilder } from "@/features/profe/components/PlanNutricionalBuilder";
import { usePlanNutricionalProfe } from "@/features/profe/hooks/useGestionAlimentacion";
import type { MacrosObjetivo } from "@/features/alumna/types/plan-nutricional";

type AlumnaAlimentacionWorkspaceProps = {
  alumnaId: string;
  alumnaNombre: string;
  alumnaEmail?: string;
  onDirtyChange?: (dirty: boolean) => void;
};

export function AlumnaAlimentacionWorkspace({
  alumnaId,
  alumnaNombre,
  onDirtyChange,
}: AlumnaAlimentacionWorkspaceProps) {
  const { plan, loading, refetch } = usePlanNutricionalProfe(alumnaId);
  const [macrosSugeridos, setMacrosSugeridos] = useState<MacrosObjetivo | null>(null);

  return (
    <section className="gestion-alimentacion-workspace">
      <EvaluacionNutricionalResumen
        alumnaId={alumnaId}
        onBriefingLoaded={(briefing) => setMacrosSugeridos(briefing.macrosSugeridos)}
      />

      <PlanNutricionalBuilder
        alumnaId={alumnaId}
        alumnaNombre={alumnaNombre}
        plan={plan}
        loading={loading}
        macrosSugeridos={macrosSugeridos}
        onSaved={() => void refetch()}
        onDirtyChange={onDirtyChange}
      />
    </section>
  );
}
