"use client";

import { memo } from "react";
import {
  CalendarCheck,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PanelDashboardDto } from "@/features/profe/types/panel";
import {
  formatCurrency,
  formatDelta,
  formatNumber,
} from "@/features/profe/utils/panel-format";
import { CrystalStar } from "@/features/profe/components/panel/CrystalStar";
import { MetricSparkline } from "@/features/profe/components/panel/MetricSparkline";

type PanelMetricCardsProps = {
  metricas: PanelDashboardDto["metricas"];
  tendencias: PanelDashboardDto["tendencias"];
  progreso30d: PanelDashboardDto["progreso30d"];
};

type MetricCardConfig = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  delta?: { text: string; direction: "up" | "down" | "flat" };
  sparkline?: number[];
  star?: boolean;
};

export const PanelMetricCards = memo(function PanelMetricCards({
  metricas,
  tendencias,
  progreso30d,
}: PanelMetricCardsProps) {
  const sparklineData = progreso30d.map((point) => point.completados);

  const cards: MetricCardConfig[] = [
    {
      id: "alumnas",
      label: "Alumnas Activas",
      value: formatNumber(metricas.alumnasActivas),
      icon: Users,
      delta: {
        text: `+${formatNumber(tendencias.alumnasNuevas)} este mes`,
        direction: tendencias.alumnasNuevas > 0 ? "up" : "flat",
      },
    },
    {
      id: "entrenamientos",
      label: "Entrenamientos Planificados",
      value: formatNumber(metricas.entrenamientosPlanificados),
      icon: CalendarCheck,
      delta: {
        text: formatDelta(tendencias.entrenamientosDelta),
        direction:
          tendencias.entrenamientosDelta === null ||
          tendencias.entrenamientosDelta === 0
            ? "flat"
            : tendencias.entrenamientosDelta > 0
              ? "up"
              : "down",
      },
      sparkline: sparklineData,
    },
    {
      id: "ingresos",
      label: "Ingresos este mes",
      value: formatCurrency(
        metricas.ingresosMes.monto,
        metricas.ingresosMes.moneda,
      ),
      icon: Wallet,
      delta: {
        text: formatDelta(tendencias.ingresosDelta),
        direction:
          tendencias.ingresosDelta === null ||
          tendencias.ingresosDelta === 0
            ? "flat"
            : tendencias.ingresosDelta > 0
              ? "up"
              : "down",
      },
    },
    {
      id: "satisfaccion",
      label: "Satisfacción Promedio",
      value: `${metricas.satisfaccionPromedio.toFixed(1)}/5`,
      icon: Star,
      hint: "Adherencia promedio",
      star: true,
    },
  ];

  return (
    <div className="profe-dashboard__metrics">
      {cards.map((card) => (
        <article
          key={card.id}
          className="profe-dashboard__metric-card glass-surface glass-surface--elevated"
        >
          <div className="profe-dashboard__metric-top">
            <span className="profe-dashboard__metric-icon" aria-hidden>
              <card.icon size={18} strokeWidth={1.75} />
            </span>
            {card.delta ? (
              <span
                className={`profe-dashboard__metric-delta profe-dashboard__metric-delta--${card.delta.direction}`}
              >
                {card.delta.text}
              </span>
            ) : null}
          </div>

          <span className="profe-dashboard__metric-label">{card.label}</span>
          <strong className="profe-dashboard__metric-value">
            {card.value}
            {card.star ? (
              <CrystalStar size={20} className="profe-dashboard__metric-star" />
            ) : null}
          </strong>
          {card.hint ? (
            <span className="profe-dashboard__metric-hint">{card.hint}</span>
          ) : null}
          {card.sparkline ? <MetricSparkline data={card.sparkline} /> : null}
        </article>
      ))}
    </div>
  );
});
