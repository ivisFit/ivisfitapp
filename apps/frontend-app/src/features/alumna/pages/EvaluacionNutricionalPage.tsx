"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { IvisContentLoader } from "@/components/IvisContentLoader";
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
      <IvisContentLoader label="Cargando evaluación" />
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
