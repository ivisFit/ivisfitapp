"use client";

import Link from "next/link";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import {
  profeAlumnaAlimentacionTabRoute,
  profeAlumnaDetailRoute,
} from "@/routes/paths";

type AlimentacionPlanHeroProps = {
  alumnaId: string;
  alumnaNombre: string;
};

export function AlimentacionPlanHero({
  alumnaId,
  alumnaNombre,
}: AlimentacionPlanHeroProps) {
  const { saving, hasUnsavedChanges, isPublicado } = useAlimentacionPlan();

  const saveState = saving
    ? { tone: "saving", label: "Guardando…" }
    : hasUnsavedChanges
      ? { tone: "dirty", label: "Cambios sin guardar" }
      : { tone: "saved", label: "Todo guardado" };

  return (
    <>
      <nav className="ap-breadcrumb" aria-label="Ruta de navegación">
        <Link href={profeAlumnaDetailRoute(alumnaId)}>{alumnaNombre}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href={profeAlumnaAlimentacionTabRoute(alumnaId)}>Alimentación</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">Armar plan</span>
      </nav>

      <header className="ap-hero">
        <div className="ap-hero__text">
          <span className="ap-hero__eyebrow">Plan nutricional</span>
          <h1 className="ap-hero__title">Armar plan de {alumnaNombre}</h1>
          <p className="ap-hero__subtitle">
            Definí objetivos, armá la semana día por día y publicá cuando esté listo.
          </p>
        </div>
        <div className="ap-hero__status" aria-live="polite">
          <span
            className={`ap-badge ${isPublicado ? "ap-badge--success" : "ap-badge--gold"}`}
          >
            {isPublicado ? "Publicado" : "Borrador"}
          </span>
          <span className={`ap-save-state ap-save-state--${saveState.tone}`}>
            {saveState.tone === "saving" ? (
              <LoaderCircle size={14} className="ap-spin" aria-hidden="true" />
            ) : (
              <span className="ap-save-state__dot" aria-hidden="true" />
            )}
            {saveState.label}
          </span>
        </div>
      </header>
    </>
  );
}
