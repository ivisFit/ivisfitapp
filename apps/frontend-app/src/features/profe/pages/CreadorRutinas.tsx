"use client";

import { useEffect, useRef, useState } from "react";
import { CardSkeleton } from "@/components/skeletons/AppSkeleton";
import { RutinaBuilder } from "@/features/profe/components/RutinaBuilder";
import {
  usePlanTemplates,
  type PlanTemplate,
} from "@/features/profe/hooks/usePlanTemplates";
import { scrollIntoAppMainView } from "@/lib/scroll-app-main";

export function CreadorRutinas() {
  const { planTemplates, loading, error } = usePlanTemplates();
  const [selectedPlan, setSelectedPlan] = useState<PlanTemplate | null>(null);
  const builderRef = useRef<HTMLDivElement>(null);
  const presentation = planTemplates[0]?.presentacion;

  useEffect(() => {
    setSelectedPlan((current) => {
      if (!current) return current;
      return planTemplates.find((plan) => plan.id === current.id) ?? current;
    });
  }, [planTemplates]);

  function handleSelectPlan(plan: PlanTemplate) {
    setSelectedPlan(plan);
    requestAnimationFrame(() => {
      scrollIntoAppMainView(builderRef.current, {
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="page planes-profe-page">
      <div className="planes-profe-page__hero">
        <div>
          <h1>Planes IVIS</h1>
          <p>
            Editá la plantilla de cada plan. Para personalizar la rutina de una
            alumna, hacelo desde su perfil.
          </p>
        </div>
        {presentation ? (
          <article className="planes-profe-page__presentation glass-surface glass-surface--elevated">
            <span>{presentation.lema}</span>
            <strong>{presentation.nombre}</strong>
            <p>{presentation.especialidades}</p>
          </article>
        ) : null}
      </div>

      <section className="planes-catalog">
        <div className="planes-catalog__header">
          <div>
            <h2>Programas pre-cargados</h2>
            <p>
              Estos planes son la base comercial. Guardá la plantilla para que
              esté lista al asignarla desde el perfil de cada alumna.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="planes-catalog__grid" aria-busy="true" aria-label="Cargando planes">
            <CardSkeleton lines={3} />
            <CardSkeleton lines={3} />
            <CardSkeleton lines={3} />
          </div>
        ) : null}
        {error ? <p className="auth-error">{error}</p> : null}

        {!loading && !error && planTemplates.length === 0 ? (
          <p className="planes-catalog__empty">
            No hay planes cargados. Revisá la configuración del backend.
          </p>
        ) : null}

        <div className="planes-catalog__grid">
          {planTemplates.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            return (
              <button
                className={`plan-template-card${isSelected ? " is-selected" : ""}`}
                key={plan.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectPlan(plan)}
              >
                <span className="plan-template-card__order">
                  {String(plan.orden).padStart(2, "0")}
                </span>
                <div>
                  <h3>{plan.nombre}</h3>
                  <p>{plan.resumen}</p>
                </div>
                <dl>
                  <div>
                    <dt>Duración</dt>
                    <dd>{plan.duracionLabel}</dd>
                  </div>
                  <div>
                    <dt>Formato</dt>
                    <dd>{plan.formato}</dd>
                  </div>
                  <div>
                    <dt>Inversión</dt>
                    <dd>{plan.inversion}</dd>
                  </div>
                </dl>
                <span className="plan-template-card__cta">
                  {isSelected ? "Seleccionado" : "Usar como base"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div ref={builderRef}>
        <RutinaBuilder
          mode="template"
          planTemplates={planTemplates}
          selectedPlanTemplate={selectedPlan}
          onSelectPlanTemplate={setSelectedPlan}
        />
      </div>
    </div>
  );
}
