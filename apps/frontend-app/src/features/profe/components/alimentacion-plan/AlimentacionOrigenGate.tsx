"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  History,
  LayoutTemplate,
  PenLine,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components";
import { AlimentacionStepHeader } from "@/features/profe/components/alimentacion-plan/AlimentacionStepChrome";
import { apiFetch } from "@/lib/api";
import { useAlimentacionPlan } from "@/features/profe/context/AlimentacionPlanProvider";
import type {
  PlanNutricionalApiDoc,
  PlanReutilizableItem,
} from "@/features/alumna/types/plan-nutricional";
import { buildEmptyWeek, defaultWeekDayNames } from "@/features/profe/lib/plan-macros";

type PlantillaItem = {
  _id: string;
  titulo: string;
  descripcion?: string;
};

type AlimentacionOrigenGateProps = {
  onReady: () => void;
};

export function AlimentacionOrigenGate({ onReady }: AlimentacionOrigenGateProps) {
  const {
    alumnaId,
    plan,
    macrosObjetivo,
    estructuraComidas,
    setDias,
    saveDraft,
    refetch,
  } = useAlimentacionPlan();
  const [planes, setPlanes] = useState<PlanReutilizableItem[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      apiFetch<PlanReutilizableItem[]>("/api/plan-nutricional/planes"),
      apiFetch<PlantillaItem[]>("/api/plan-nutricional/plantillas"),
    ]).then(([planesData, plantillasData]) => {
      setPlanes(planesData);
      setPlantillas(plantillasData);
    });
  }, []);

  const planId = plan?._id ?? plan?.id;

  async function startFromScratch() {
    const dias = buildEmptyWeek(
      defaultWeekDayNames(),
      estructuraComidas,
      macrosObjetivo,
    );
    setDias(dias);
    await saveDraft({ dias });
    onReady();
  }

  async function clonePlan(sourcePlanId: string) {
    setLoading(true);
    setError(null);
    try {
      await apiFetch<PlanNutricionalApiDoc>("/api/plan-nutricional/clonar", {
        method: "POST",
        body: JSON.stringify({ sourcePlanId, alumnaId, planId }),
      });
      refetch();
      onReady();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo clonar el plan");
    } finally {
      setLoading(false);
    }
  }

  async function applyPlantilla(plantillaId: string) {
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/plan-nutricional/plantillas/aplicar", {
        method: "POST",
        body: JSON.stringify({ alumnaId, plantillaId, planId }),
      });
      refetch();
      onReady();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo aplicar la plantilla",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="alimentacion-origen-gate" aria-busy={loading}>
      <AlimentacionStepHeader
        icon={<UtensilsCrossed size={20} />}
        title="¿Cómo querés armar la semana?"
        description="Elegí un punto de partida para los 7 días. Después podés editar todo."
      />

      <div className="alimentacion-origen-gate__grid">
        <article className="ap-origin-card ap-origin-card--primary">
          <span className="ap-origin-card__icon" aria-hidden="true">
            <PenLine size={20} />
          </span>
          <h3 className="ap-origin-card__title">Empezar de cero</h3>
          <p className="ap-origin-card__text">
            Una semana con las comidas vacías y los macros objetivo de cada una.
          </p>
          <div className="alimentacion-origen-gate__actions">
            <Button
              type="button"
              disabled={loading}
              onClick={() => void startFromScratch()}
            >
              Empezar en blanco
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </article>

        <article className="ap-origin-card">
          <span className="ap-origin-card__icon" aria-hidden="true">
            <History size={20} />
          </span>
          <h3 className="ap-origin-card__title">Copiar plan anterior</h3>
          <p className="ap-origin-card__text">
            Reutilizá la semana de un plan que ya armaste.
          </p>
          {planes.length > 0 ? (
            <ul className="alimentacion-origen-gate__list">
              {planes.map((plan) => (
                <li key={plan.id}>
                  <button
                    type="button"
                    className="ap-origin-item"
                    disabled={loading}
                    onClick={() => void clonePlan(plan.id)}
                  >
                    <span className="ap-origin-item__text">
                      <strong>{plan.titulo}</strong>
                      <small>{plan.alumnaNombre}</small>
                    </span>
                    <span className="ap-badge ap-badge--muted">{plan.estado}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ap-origin-card__empty">Todavía no hay planes anteriores.</p>
          )}
        </article>

        <article className="ap-origin-card">
          <span className="ap-origin-card__icon" aria-hidden="true">
            <LayoutTemplate size={20} />
          </span>
          <h3 className="ap-origin-card__title">Plantilla propia</h3>
          <p className="ap-origin-card__text">
            Aplicá una semana guardada como plantilla.
          </p>
          {plantillas.length > 0 ? (
            <ul className="alimentacion-origen-gate__list">
              {plantillas.map((plantilla) => (
                <li key={plantilla._id}>
                  <button
                    type="button"
                    className="ap-origin-item"
                    disabled={loading}
                    onClick={() => void applyPlantilla(plantilla._id)}
                  >
                    <span className="ap-origin-item__text">
                      <strong>{plantilla.titulo}</strong>
                      {plantilla.descripcion ? (
                        <small>{plantilla.descripcion}</small>
                      ) : null}
                    </span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ap-origin-card__empty">Todavía no guardaste plantillas.</p>
          )}
        </article>
      </div>

      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
