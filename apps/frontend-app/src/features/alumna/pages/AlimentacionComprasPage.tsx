"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlumnaAlimentacionSkeleton } from "@/components/skeletons/AppSkeleton";
import { ListaComprasAlumna } from "@/features/alumna/components/alimentacion/ListaComprasAlumna";
import { getDiaHoyIndex } from "@/features/alumna/lib/alimentacion-dia-hoy";
import { usePlanNutricionalAlumna } from "@/features/profe/hooks/useGestionAlimentacion";
import { alumnaRoutes } from "@/routes/paths";

export function AlimentacionComprasPage() {
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

  const diaHoy = plan.dias[getDiaHoyIndex(plan.dias.length, plan.publicadoAt)];

  return (
    <div className="alimentacion-page page alimentacion-subpage">
      <Link href={alumnaRoutes.alimentacion} className="alimentacion-subpage__back">
        <ArrowLeft size={18} aria-hidden />
        Volver
      </Link>
      <ListaComprasAlumna
        dias={plan.dias}
        diaHoy={diaHoy}
        semanas={plan.listasComprasSemanas}
      />
    </div>
  );
}
