"use client";

import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CumplimientoSummary } from "@/features/alumna/lib/progreso-charts";

const AXIS_STROKE = "rgb(212 175 55 / 35%)";
const GRID_STROKE = "rgb(212 175 55 / 12%)";
const TICK_FILL = "rgb(163 163 163)";
const BAR_FILL = "#f5c518";
const BAR_PARTIAL_FILL = "rgb(245 197 24 / 55%)";

type ProgresoCumplimientoChartProps = {
  summary: CumplimientoSummary;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; payload?: { completado?: boolean } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;
  const completado = payload[0]?.payload?.completado;

  return (
    <div className="progreso-chart-tooltip">
      <p className="progreso-chart-tooltip__title">{label}</p>
      <p>
        {completado
          ? "Día completado"
          : value > 0
            ? `${value}% de ejercicios`
            : "Sin registro"}
      </p>
    </div>
  );
}

export const ProgresoCumplimientoChart = memo(function ProgresoCumplimientoChart({
  summary,
}: ProgresoCumplimientoChartProps) {
  const isEmpty = !summary.puntos.some((point) => point.porcentaje > 0);
  const chartData = summary.puntos.map((point) => ({
    dia: point.dia,
    porcentaje: point.porcentaje,
    completado: point.completado,
  }));

  return (
    <section
      className={`progreso-chart feature-card glass-surface glass-surface--elevated${isEmpty ? " progreso-chart--empty" : ""}`}
    >
      <div className="progreso-chart__header">
        <h2>Cumplimiento diario</h2>
        <p className="progreso-chart__summary">
          {summary.completados} de {summary.total} días completados esta semana
        </p>
      </div>

      <div className="progreso-chart__canvas">
        {isEmpty ? (
          <p className="progreso-chart__empty" aria-live="polite">
            Aún no registraste entrenamientos esta semana.
          </p>
        ) : null}

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={{ stroke: AXIS_STROKE }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={{ stroke: AXIS_STROKE }}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="porcentaje" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.dia}
                  fill={entry.completado ? BAR_FILL : BAR_PARTIAL_FILL}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
});
