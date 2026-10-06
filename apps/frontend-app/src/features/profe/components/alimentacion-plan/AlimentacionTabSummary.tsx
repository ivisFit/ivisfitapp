"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components";
import { useAppDialog } from "@/components/AppDialogProvider";
import { apiFetch, formatApiError } from "@/lib/api";
import { usePlanNutricionalProfe } from "@/features/profe/hooks/useGestionAlimentacion";
import { planDocId } from "@/features/profe/context/AlimentacionPlanProvider";
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
  const { plan, planBorrador, planPublicado, loading, refetch } =
    usePlanNutricionalProfe(alumnaId);
  const dialog = useAppDialog();
  const [evaluacion, setEvaluacion] = useState<EvaluacionNutricionalApiDoc | null>(
    null,
  );
  const [discarding, setDiscarding] = useState(false);
  const [discardError, setDiscardError] = useState<string | null>(null);

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

  async function handleDiscardDraft() {
    const draftId = planDocId(planBorrador);
    if (!draftId) return;

    const confirmed = await dialog.confirm({
      title: "Eliminar borrador",
      message: planPublicado
        ? "¿Eliminar este borrador? La alumna sigue viendo el plan publicado."
        : "¿Eliminar este borrador? Esta acción no se puede deshacer.",
      tone: "danger",
      confirmLabel: "Eliminar",
    });
    if (!confirmed) return;

    setDiscarding(true);
    setDiscardError(null);
    try {
      await apiFetch(`/api/plan-nutricional/${draftId}`, { method: "DELETE" });
      await refetch();
    } catch (err) {
      setDiscardError(formatApiError(err));
    } finally {
      setDiscarding(false);
    }
  }

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
            <strong>
              {planBorrador
                ? `${planBorrador.titulo}${planBorrador.updatedAt ? ` · ${new Date(planBorrador.updatedAt).toLocaleDateString("es-AR")}` : ""}`
                : "Sin borrador activo"}
            </strong>
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
      {discardError ? (
        <p className="auth-error" role="alert">
          {discardError}
        </p>
      ) : null}
      <div className="alimentacion-tab-summary__actions">
        <Link className="btn btn--primary ap-footer__cta" href={continueHref}>
          <span>
            {editing
              ? planBorrador
                ? "Continuar borrador"
                : "Continuar armado del plan"
              : "Armar plan nutricional"}
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        {planBorrador ? (
          <Button
            type="button"
            variant="ghost"
            className="ap-footer__cta"
            disabled={discarding}
            onClick={() => void handleDiscardDraft()}
          >
            <Trash2 size={16} aria-hidden="true" />
            {discarding ? "Descartando…" : "Descartar borrador"}
          </Button>
        ) : null}
        <Link className="btn btn--ghost ap-footer__cta" href={profeAlumnaAlimentacionRoute(alumnaId)}>
          Abrir asistente de plan
        </Link>
      </div>
    </section>
  );
}
