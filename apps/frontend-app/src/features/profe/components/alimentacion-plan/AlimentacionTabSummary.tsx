"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { usePlanNutricionalProfe } from "@/features/profe/hooks/useGestionAlimentacion";
import type { EvaluacionNutricionalApiDoc } from "@/features/alumna/types/evaluacion-nutricional";
import {
  profeAlumnaAlimentacionRoute,
  profeAlumnaAlimentacionStepRoute,
} from "@/routes/paths";
import { resolveAlimentacionEntryStep } from "@/features/profe/lib/plan-alimentacion-steps";

type AlimentacionTabSummaryProps = {
  alumnaId: string;
  alumnaNombre: string;
};

export function AlimentacionTabSummary({
  alumnaId,
  alumnaNombre,
}: AlimentacionTabSummaryProps) {
  const { plan, planBorrador, planPublicado, loading } =
    usePlanNutricionalProfe(alumnaId);
  const [evaluacion, setEvaluacion] = useState<EvaluacionNutricionalApiDoc | null>(
    null,
  );

  useEffect(() => {
    void apiFetch<EvaluacionNutricionalApiDoc[]>(
      `/api/evaluacion-nutricional?alumnaId=${encodeURIComponent(alumnaId)}`,
    ).then((items) => setEvaluacion(items[0] ?? null));
  }, [alumnaId]);

  if (loading) {
    return <p className="alumnas-panel__status">Cargando alimentación…</p>;
  }

  const hasEvaluacion = Boolean(evaluacion?.completada);
  const editing = planBorrador ?? plan;
  const entryStep = resolveAlimentacionEntryStep(editing, hasEvaluacion);
  const continueHref = profeAlumnaAlimentacionStepRoute(alumnaId, entryStep);

  return (
    <section className="alimentacion-tab-summary">
      <header className="alimentacion-tab-summary__header">
        <span className="alimentacion-tab-summary__icon" aria-hidden="true">
          <UtensilsCrossed size={20} />
        </span>
        <div>
          <h2 className="alimentacion-tab-summary__title">
            Alimentación de {alumnaNombre}
          </h2>
          <p className="alimentacion-tab-summary__subtitle">
            Estado actual del plan nutricional.
          </p>
        </div>
      </header>
      {!hasEvaluacion ? (
        <p className="ap-inline-note ap-inline-note--warning">
          La alumna aún no completó la evaluación nutricional.
        </p>
      ) : (
        <ul className="alimentacion-tab-summary__status">
          <li>
            <span className="alimentacion-tab-summary__label">Plan publicado</span>
            <strong>{planPublicado ? planPublicado.titulo : "Ninguno"}</strong>
          </li>
          <li>
            <span className="alimentacion-tab-summary__label">Borrador</span>
            <strong>{planBorrador ? planBorrador.titulo : "Sin borrador activo"}</strong>
          </li>
          {editing?.macrosObjetivo ? (
            <li>
              <span className="alimentacion-tab-summary__label">Objetivo diario</span>
              <strong>
                {editing.macrosObjetivo.kcal} kcal · P {editing.macrosObjetivo.proteinaG} g
              </strong>
            </li>
          ) : null}
        </ul>
      )}
      <div className="alimentacion-tab-summary__actions">
        <Link className="btn btn--primary ap-footer__cta" href={continueHref}>
          <span>{editing ? "Continuar armado del plan" : "Armar plan nutricional"}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link className="btn btn--ghost ap-footer__cta" href={profeAlumnaAlimentacionRoute(alumnaId)}>
          Abrir asistente de plan
        </Link>
      </div>
    </section>
  );
}
