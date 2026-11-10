"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AlumnaAlimentacionSkeleton } from "@/components/skeletons/AppSkeleton";
import { CoachInsightBanner } from "@/features/alumna/components/CoachInsightBanner";
import { PlanNutricionalDashboard } from "@/features/alumna/components/alimentacion/PlanNutricionalDashboard";
import type { AlimentacionVista } from "@/features/alumna/components/alimentacion/PlanNutricionalDashboard";
import { WaitingStateActions } from "@/features/alumna/components/WaitingStateActions";
import { useEvaluacionBridgeTransition } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeProvider";
import { useEvaluacionNutricional } from "@/features/alumna/hooks/useEvaluacionNutricional";
import { usePlanNutricionalAlumna } from "@/features/profe/hooks/useGestionAlimentacion";
import { useAuth } from "@/context/AuthContext";
import { alumnaRoutes } from "@/routes/paths";

function AlimentacionWaiting({ nombre }: { nombre?: string }) {
  return (
    <section className="comida-espera">
      <p className="comida-kicker">Menú</p>
      <h1>Tu menú está en camino</h1>
      <p>
        Tu evaluación ya quedó registrada. Cuando tu profesora publique el plan,
        vas a ver el día acá, comida por comida.
      </p>
      <WaitingStateActions
        nombre={nombre}
        whatsappTema="consulto por mi plan de alimentación"
      />
    </section>
  );
}

export function AlimentacionPage({
  initialView = "hoy",
  planAnchor,
}: {
  initialView?: AlimentacionVista;
  planAnchor?: "macros" | "compras";
}) {
  const router = useRouter();
  const { user } = useAuth();
  const runBridgeTransition = useEvaluacionBridgeTransition();
  const {
    evaluacion,
    loading: evaluacionLoading,
    error: evaluacionError,
    refetch: evaluacionRefetch,
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
      evaluacionError ||
      evaluacion?.completada ||
      transitionStartedRef.current
    ) {
      return;
    }

    transitionStartedRef.current = true;
    runBridgeTransition("toEvaluacion", alumnaRoutes.evaluacionNutricional, () =>
      router.replace(alumnaRoutes.evaluacionNutricional),
    );
  }, [
    evaluacion?.completada,
    evaluacionError,
    evaluacionLoading,
    router,
    runBridgeTransition,
  ]);

  useEffect(() => {
    if (evaluacion?.completada) {
      void refetchPlan();
    }
  }, [evaluacion?.completada, refetchPlan]);

  const loading = evaluacionLoading || (evaluacion?.completada && planLoading);
  const error = evaluacionError ?? planError;

  function retry() {
    evaluacionRefetch();
    void refetchPlan();
  }

  if (loading) {
    return (
      <>
        <CoachInsightBanner />
        <AlumnaAlimentacionSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <div className="alimentacion-page page">
        <CoachInsightBanner />
        <div className="comida-estado" role="alert">
          <h2>No pudimos cargar tu menú</h2>
          <p>{error}</p>
          <button type="button" className="btn btn--primary" onClick={retry}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!evaluacion?.completada) {
    return (
      <div className="alimentacion-page page" aria-busy="true">
        <CoachInsightBanner />
        <AlumnaAlimentacionSkeleton />
        <p className="comida-vacio">Te estamos llevando a tu evaluación nutricional.</p>
      </div>
    );
  }

  return (
    <div className="alimentacion-page alimentacion-page--fill page">
      <CoachInsightBanner />
      {plan ? (
        <PlanNutricionalDashboard
          plan={plan}
          initialView={initialView}
          planAnchor={planAnchor}
        />
      ) : (
        <AlimentacionWaiting nombre={user?.name} />
      )}
    </div>
  );
}
