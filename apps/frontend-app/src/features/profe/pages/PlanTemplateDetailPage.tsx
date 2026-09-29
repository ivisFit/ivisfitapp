"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { FormSkeleton, PageHeaderSkeleton, SkeletonCard } from "@/components/skeletons/AppSkeleton";
import { RutinaBuilder } from "@/features/profe/components/RutinaBuilder";
import { usePlanTemplateDetail } from "@/features/profe/hooks/usePlanTemplateDetail";
import { profeRoutes } from "@/routes/paths";

export function PlanTemplateDetailPage({ planId }: { planId: string }) {
  const { plan, loading, error, refetch } = usePlanTemplateDetail(planId);

  if (error) {
    return (
      <div className="page planes-profe-page">
        <p className="page__back">
          <Link href={profeRoutes.nuevaRutina}>← Volver a laboratorio</Link>
        </p>
        <p className="auth-error">{error}</p>
        <Button type="button" variant="ghost" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (loading || !plan) {
    return (
      <div
        className="page planes-profe-page sk-stack"
        aria-busy="true"
        aria-label="Cargando plantilla"
      >
        <p className="page__back">
          <Link href={profeRoutes.nuevaRutina}>← Volver a laboratorio</Link>
        </p>
        <PageHeaderSkeleton titleWidth="w-48" subtitle={false} />
        <SkeletonCard elevated>
          <FormSkeleton fields={4} />
        </SkeletonCard>
      </div>
    );
  }

  return (
    <div className="page planes-profe-page">
      <p className="page__back">
        <Link href={profeRoutes.nuevaRutina}>← Volver a laboratorio</Link>
      </p>
      <RutinaBuilder
        mode="template"
        planTemplates={[plan]}
        selectedPlanTemplate={plan}
      />
    </div>
  );
}
