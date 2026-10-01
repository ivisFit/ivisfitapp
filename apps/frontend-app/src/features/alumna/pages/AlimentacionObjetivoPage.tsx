"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlumnaAlimentacionSkeleton } from "@/components/skeletons/AppSkeleton";
import {
  ComposicionResumenAlumna,
  MacrosSummary,
} from "@/features/alumna/components/alimentacion/PlanNutricionalDashboard";
import { usePlanNutricionalAlumna } from "@/features/profe/hooks/useGestionAlimentacion";
import { alumnaRoutes } from "@/routes/paths";

export function AlimentacionObjetivoPage() {
  const { plan, loading, error } = usePlanNutricionalAlumna();

  if (loading) return <AlumnaAlimentacionSkeleton />;

  if (error) {
    return (
      <div className="alimentacion-page page">
        <p className="auth-error">{error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="alimentacion-page page">
        <p>Todavía no tenés un plan publicado.</p>
        <Link href={alumnaRoutes.alimentacion}>Volver</Link>
      </div>
    );
  }

  return (
    <div className="alimentacion-page page alimentacion-subpage">
      <Link href={alumnaRoutes.alimentacion} className="alimentacion-subpage__back">
        <ArrowLeft size={18} aria-hidden />
        Volver
      </Link>
      <MacrosSummary macros={plan.macrosObjetivo} />
      <ComposicionResumenAlumna />
    </div>
  );
}
