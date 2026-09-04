"use client";

import Link from "next/link";
import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import { usePlanTemplates } from "@/features/profe/hooks/usePlanTemplates";
import { profePlanTemplateDetailRoute } from "@/routes/paths";

function ChevronIcon() {
  return (
    <svg
      className="plan-template-card__chevron"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function CreadorRutinas() {
  const { planTemplates, loading, error } = usePlanTemplates();

  return (
    <div className="page planes-profe-page">
      <div className="planes-profe-page__hero">
        <h1>Laboratorio de planes</h1>
        <p>
          Editá la plantilla de cada plan. Para personalizar la rutina de una
          alumna, hacelo desde su perfil.
        </p>
      </div>

      <section className="planes-catalog" aria-label="Plantillas">
        {loading ? (
          <div
            className="planes-catalog__list"
            aria-busy="true"
            aria-label="Cargando plantillas"
          >
            <ListSkeleton items={5} />
          </div>
        ) : null}
        {error ? <p className="auth-error">{error}</p> : null}

        {!loading && !error && planTemplates.length === 0 ? (
          <p className="planes-catalog__empty">
            No hay plantillas cargadas. Revisá la configuración del backend.
          </p>
        ) : null}

        {!loading && planTemplates.length > 0 ? (
          <ul className="planes-catalog__list">
            {planTemplates.map((plan) => (
              <li key={plan.id}>
                <Link
                  href={profePlanTemplateDetailRoute(plan.id)}
                  className="plan-template-card"
                  aria-label={`Editar plantilla ${plan.nombre}`}
                >
                  <span className="plan-template-card__order">
                    {String(plan.orden).padStart(2, "0")}
                  </span>
                  <span className="plan-template-card__info">
                    <span className="plan-template-card__name">{plan.nombre}</span>
                    <span className="plan-template-card__summary">{plan.resumen}</span>
                  </span>
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
                  <ChevronIcon />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
