"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormSkeleton, SkeletonLine } from "@/components/skeletons/AppSkeleton";
import { NutricionWizard } from "@/features/alumna/components/alimentacion/NutricionWizard";
import { useEvaluacionBridgeTransition } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeProvider";
import { useEvaluacionNutricional } from "@/features/alumna/hooks/useEvaluacionNutricional";
import { alumnaRoutes } from "@/routes/paths";

export function EvaluacionNutricionalPage() {
  const router = useRouter();
  const runBridgeTransition = useEvaluacionBridgeTransition();
  const { evaluacion, loading, error } = useEvaluacionNutricional();
  const guardTransitionStartedRef = useRef(false);

  useEffect(() => {
    router.prefetch(alumnaRoutes.alimentacion);
  }, [router]);

  useEffect(() => {
    if (loading || !evaluacion?.completada || guardTransitionStartedRef.current) {
      return;
    }

    guardTransitionStartedRef.current = true;
    runBridgeTransition(
      "toAlimentacion",
      alumnaRoutes.alimentacion,
      () => router.replace(alumnaRoutes.alimentacion),
    );
  }, [evaluacion?.completada, loading, router, runBridgeTransition]);

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Cargando evaluación">
        <SkeletonLine size="2xl" width="w-40" gold />
        <SkeletonLine size="sm" width="w-60" />
        <div className="sk sk--card-elevated">
          <FormSkeleton fields={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="auth-error">{error}</p>;
  }

  if (evaluacion?.completada) {
    return null;
  }

  return (
    <NutricionWizard
      onComplete={() =>
        runBridgeTransition(
          "toAlimentacion",
          alumnaRoutes.alimentacion,
          () => router.replace(alumnaRoutes.alimentacion),
        )
      }
    />
  );
}
