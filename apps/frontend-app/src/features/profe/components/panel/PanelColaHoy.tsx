"use client";

import Link from "next/link";
import {
  profeAlumnasAdmisionesRoute,
  profeAlumnasFiltroRoute,
  type AlumnasListaFiltro,
} from "@/routes/paths";
import { useProfeCola } from "@/features/profe/hooks/useProfeCola";

type ColaCard = {
  label: string;
  value: number;
  href: string;
  preview?: string[];
};

function previewNames(
  people: Array<{ nombre: string }> | undefined,
  limit = 2,
): string[] | undefined {
  if (!people?.length) return undefined;
  return people.slice(0, limit).map((p) => p.nombre);
}

/** Prefer full cola from /api/panel/cola; fall back to dashboard counts. */
export function PanelColaHoy({
  counts: countsFallback,
}: {
  counts?: {
    admisionesPendientes: number;
    sinRutina: number;
    evalSinPlan: number;
    checkinsAtencion: number;
    adherenciaBaja: number;
    membresiasPorVencer: number;
    membresiasVencidas: number;
  };
}) {
  const { cola, loading } = useProfeCola(true);
  const counts = cola?.counts ?? countsFallback;

  if (!counts) {
    if (loading) {
      return (
        <section className="profe-dashboard__cola glass-surface">
          <h2 className="profe-dashboard__card-title">Para hoy</h2>
          <p className="profe-dashboard__empty">Cargando cola…</p>
        </section>
      );
    }
    return null;
  }

  const cards: ColaCard[] = [
    {
      label: "Admisiones",
      value: counts.admisionesPendientes,
      href: profeAlumnasAdmisionesRoute(),
    },
    {
      label: "Sin rutina",
      value: counts.sinRutina,
      href: profeAlumnasFiltroRoute("sin_rutina"),
      preview: previewNames(cola?.sinRutina),
    },
    {
      label: "Eval. sin plan",
      value: counts.evalSinPlan,
      href: profeAlumnasFiltroRoute("eval_sin_plan"),
      preview: previewNames(cola?.evalSinPlan),
    },
    {
      label: "Check-ins hoy",
      value: counts.checkinsAtencion,
      href: profeAlumnasFiltroRoute("checkins_hoy"),
      preview: previewNames(cola?.checkinsAtencion),
    },
    {
      label: "Adherencia baja",
      value: counts.adherenciaBaja,
      href: profeAlumnasFiltroRoute("adherencia_baja"),
      preview: previewNames(cola?.adherenciaBaja),
    },
    {
      label: "Membresías",
      value: counts.membresiasPorVencer + counts.membresiasVencidas,
      href: profeAlumnasFiltroRoute("membresias" satisfies AlumnasListaFiltro),
      preview: previewNames([
        ...(cola?.membresiasPorVencer ?? []),
        ...(cola?.membresiasVencidas ?? []),
      ]),
    },
  ].filter((card) => card.value > 0);

  if (cards.length === 0) {
    return (
      <section className="profe-dashboard__cola glass-surface">
        <h2 className="profe-dashboard__card-title">Para hoy</h2>
        <p className="profe-dashboard__empty">
          No hay pendientes urgentes. Buen ritmo.
        </p>
      </section>
    );
  }

  return (
    <section className="profe-dashboard__cola">
      <h2 className="profe-dashboard__card-title">Para hoy</h2>
      <div className="profe-dashboard__cola-grid">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="profe-dashboard__cola-card glass-surface glass-surface--elevated"
          >
            <span className="profe-dashboard__cola-value">{card.value}</span>
            <span className="profe-dashboard__cola-label">{card.label}</span>
            {card.preview?.length ? (
              <span className="profe-dashboard__cola-preview">
                {card.preview.join(", ")}
                {card.value > card.preview.length ? "…" : ""}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
