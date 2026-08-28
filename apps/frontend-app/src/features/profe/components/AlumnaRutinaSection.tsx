"use client";

import { memo, useState } from "react";
import dynamic from "next/dynamic";
import { CardSkeleton } from "@/components/skeletons/AppSkeleton";
import type { AlumnaDetail } from "@/types/usuario";
import type { PlanTemplate } from "@/features/profe/hooks/usePlanTemplates";

const RutinaBuilder = dynamic(
  () =>
    import("@/features/profe/components/RutinaBuilder").then(
      (mod) => mod.RutinaBuilder,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="alumna-detail-rutina"
        aria-busy="true"
        aria-label="Cargando editor de rutina"
      >
        <CardSkeleton lines={4} />
      </div>
    ),
  },
);

type AlumnaRutinaSectionProps = {
  alumna: AlumnaDetail;
  planTemplates: PlanTemplate[];
  onDirtyChange?: (dirty: boolean) => void;
};

function AlumnaRutinaSectionRaw({
  alumna,
  planTemplates,
  onDirtyChange,
}: AlumnaRutinaSectionProps) {
  const [selectedPlanTemplate, setSelectedPlanTemplate] =
    useState<PlanTemplate | null>(null);

  return (
    <section className="alumna-detail-rutina">
      <RutinaBuilder
        mode="alumna"
        alumnaId={alumna.id}
        alumnaNombre={alumna.nombre}
        planTemplates={planTemplates}
        selectedPlanTemplate={selectedPlanTemplate}
        onSelectPlanTemplate={setSelectedPlanTemplate}
        onDirtyChange={onDirtyChange}
      />
    </section>
  );
}

export const AlumnaRutinaSection = memo(AlumnaRutinaSectionRaw);
