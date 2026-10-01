"use client";

import { useParams } from "next/navigation";
import { PageHeaderSkeleton } from "@/components/skeletons/AppSkeleton";
import { useAlumna } from "@/features/profe/hooks/useAlumna";
import { AlimentacionPlanProvider } from "@/features/profe/context/AlimentacionPlanProvider";
import { AlimentacionAlertRail } from "@/features/profe/components/alimentacion-plan/AlimentacionAlertRail";
import { AlimentacionStepperNav } from "@/features/profe/components/alimentacion-plan/AlimentacionStepperNav";
import { AlumnaUnsavedChangesProvider } from "@/features/profe/context/AlumnaUnsavedChangesProvider";
import { useAlumnaUnsavedReporter } from "@/features/profe/context/AlumnaUnsavedChangesProvider";
import { AlimentacionPlanHero } from "@/features/profe/components/alimentacion-plan/AlimentacionPlanHero";

function AlimentacionPlanChrome({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { alumna, loading, error } = useAlumna(id);
  const { reportSectionDirty } = useAlumnaUnsavedReporter();

  if (!id) {
    return <p className="auth-error">Alumna no encontrada</p>;
  }

  if (loading) {
    return <PageHeaderSkeleton titleWidth="w-56" subtitle={false} />;
  }

  if (error) {
    return <p className="auth-error">{error}</p>;
  }

  const nombre = alumna?.nombre ?? "Alumna";

  return (
    <AlimentacionPlanProvider
      alumnaId={id}
      onDirtyChange={(dirty) => reportSectionDirty("alimentacion", dirty)}
    >
      <div className="alimentacion-plan-shell page">
        <AlimentacionPlanHero alumnaId={id} alumnaNombre={nombre} />
        <AlimentacionStepperNav alumnaId={id} />
        <div className="alimentacion-plan-shell__body">
          <AlimentacionAlertRail alumnaId={id} />
          <div className="alimentacion-plan-shell__main">{children}</div>
        </div>
      </div>
    </AlimentacionPlanProvider>
  );
}

export function AlimentacionPlanShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  if (!id) {
    return <p className="auth-error">Alumna no encontrada</p>;
  }

  return (
    <AlumnaUnsavedChangesProvider alumnaId={id}>
      <AlimentacionPlanChrome>{children}</AlimentacionPlanChrome>
    </AlumnaUnsavedChangesProvider>
  );
}
