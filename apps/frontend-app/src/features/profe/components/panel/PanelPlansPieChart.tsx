"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PanelPlanDistribution } from "@/features/profe/types/panel";

const PIE_COLORS = ["#f5c518", "#d4af37", "#8a6d3b", "#5c4a1f", "#3d3218"];

type PanelPlansPieChartProps = {
  data: PanelPlanDistribution[];
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: PanelPlanDistribution }[];
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="profe-dashboard__chart-tooltip">
      <p className="profe-dashboard__chart-tooltip-title">{item.nombre}</p>
      <p>
        {item.cantidad} ({item.porcentaje}%)
      </p>
    </div>
  );
}

export function PanelPlansPieChart({ data }: PanelPlansPieChartProps) {
  const isEmpty = data.length === 0;

  return (
    <section
      className={`profe-dashboard__chart-card glass-surface glass-surface--elevated${isEmpty ? " profe-dashboard__chart-card--empty" : ""}`}
    >
      <h3 className="profe-dashboard__chart-title">Tipos de Planes Asignados</h3>

      <div className="profe-dashboard__chart-canvas profe-dashboard__chart-canvas--pie">
        {isEmpty ? (
          <p className="profe-dashboard__chart-empty" aria-live="polite">
            Sin planes asignados todavía.
          </p>
        ) : null}

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="cantidad"
              nameKey="nombre"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={96}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.nombre}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {!isEmpty ? (
          <ul className="profe-dashboard__pie-legend">
            {data.map((item, index) => (
              <li key={item.nombre} className="profe-dashboard__pie-legend-item">
                <span
                  className="profe-dashboard__pie-legend-dot"
                  style={{
                    backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                  }}
                  aria-hidden
                />
                <span>{item.nombre}</span>
                <span className="profe-dashboard__pie-legend-value">
                  {item.porcentaje}%
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
