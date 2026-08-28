"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Salad } from "lucide-react";
import {
  CardSkeleton,
  InlineSkeleton,
  SkeletonLine,
} from "@/components/skeletons/AppSkeleton";
import { PlanNutricionalDashboard } from "@/features/alumna/components/alimentacion/PlanNutricionalDashboard";
import { WaitingStateActions } from "@/features/alumna/components/WaitingStateActions";
import { useEvaluacionBridgeTransition } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeProvider";
import { useEvaluacionNutricional } from "@/features/alumna/hooks/useEvaluacionNutricional";
import { usePlanNutricionalAlumna } from "@/features/profe/hooks/useGestionAlimentacion";
import { useAuth } from "@/context/AuthContext";
import { alumnaRoutes } from "@/routes/paths";

function AlimentacionWaitingDashboard({ nombre }: { nombre?: string }) {
  return (
    <section className="feature-card alimentacion-waiting">
      <span className="alimentacion-waiting__icon" aria-hidden>
        <Salad size={28} />
      </span>
      <p className="nutricion-wizard__eyebrow">Plan nutricional</p>
      <h1>Alimentación</h1>
      <p className="alimentacion-waiting__text">
        Tu evaluación inicial fue registrada. Tu profesora está preparando tu
        plan nutricional personalizado.
      </p>
      <p className="alimentacion-dashboard__status">Evaluación completada</p>
      <WaitingStateActions
        nombre={nombre}
        whatsappTema="consulto por mi plan de alimentación"
      />
    </section>
  );
}

export function AlimentacionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const runBridgeTransition = useEvaluacionBridgeTransition();
  const {
    evaluacion,
    loading: evaluacionLoading,
    error: evaluacionError,
  } = useEvaluacionNutricional();
  const {
    plan,
    loading: planLoading,
    error: planError,
    refetch: refetchPlan,
  } = usePlanNutricionalAlumna();
  const transitionStartedRef = useRef(false);

  useEffect(() => {
    router.prefetch(alumnaRoutes.evaluacionNutricional);
  }, [router]);

  useEffect(() => {
    if (
      evaluacionLoading ||
      evaluacion?.completada ||
      transitionStartedRef.current
    ) {
      return;
    }

    transitionStartedRef.current = true;
    runBridgeTransition(
      "toEvaluacion",
      alumnaRoutes.evaluacionNutricional,
      () => router.replace(alumnaRoutes.evaluacionNutricional),
    );
  }, [evaluacion?.completada, evaluacionLoading, router, runBridgeTransition]);

  useEffect(() => {
    if (evaluacion?.completada) {
      void refetchPlan();
    }
  }, [evaluacion?.completada, refetchPlan]);

  const loading = evaluacionLoading || (evaluacion?.completada && planLoading);
  const error = evaluacionError ?? planError;

  if (loading) {
    return (
      <div
        className="alimentacion-page page"
        aria-busy="true"
        aria-label="Cargando alimentación"
      >
        <SkeletonLine size="2xl" width="w-40" gold />
        <SkeletonLine size="sm" width="w-60" />
        <CardSkeleton lines={3} elevated />
        <InlineSkeleton />
        <InlineSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alimentacion-page page">
        <p className="auth-error">{error}</p>
      </div>
    );
  }

  if (!evaluacion?.completada) {
    return null;
  }

  return (
    <div className="alimentacion-page page">
      {plan ? (
        <PlanNutricionalDashboard plan={plan} />
      ) : (
        <AlimentacionWaitingDashboard nombre={user?.name} />
      )}
    </div>
  );
}
