"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  PanelTrendPoint,
  PanelWeeklyPoint,
} from "@/features/profe/types/panel";
import { formatShortDate } from "@/features/profe/utils/panel-format";

const AXIS_STROKE = "rgb(212 175 55 / 35%)";
const GRID_STROKE = "rgb(212 175 55 / 12%)";
const TICK_FILL = "rgb(163 163 163)";
const BAR_FILL = "#f5c518";

type PanelWeeklyBarChartProps = {
  data7d: PanelWeeklyPoint[];
  data30d: PanelTrendPoint[];
};

type Range = "7d" | "30d";

type Point = {
  dia: string;
  completados: number;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="profe-dashboard__chart-tooltip">
      <p className="profe-dashboard__chart-tooltip-title">{label}</p>
      <p>{payload[0]?.value ?? 0} completados</p>
    </div>
  );
}

function labelFor(point: Point, range: Range): string {
  if (range === "7d") return point.dia;
  return formatShortDate(point.dia);
}

export function PanelWeeklyBarChart({
  data7d,
  data30d,
}: PanelWeeklyBarChartProps) {
  const [range, setRange] = useState<Range>("7d");

  const data: Point[] =
    range === "7d"
      ? data7d.map((point) => ({ ...point }))
      : data30d.map((point) => ({ ...point }));
  const isEmpty = data.every((point) => point.completados === 0);

  return (
    <section
      className={`profe-dashboard__chart-card glass-surface glass-surface--elevated${isEmpty ? " profe-dashboard__chart-card--empty" : ""}`}
    >
      <div className="profe-dashboard__chart-header">
        <h3 className="profe-dashboard__chart-title">
          Entrenamientos completados
        </h3>
        <div
          className="profe-dashboard__range-toggle"
          role="group"
          aria-label="Rango del gráfico"
        >
          <button
            type="button"
            className={`profe-dashboard__range-btn${range === "7d" ? " is-active" : ""}`}
            onClick={() => setRange("7d")}
            aria-pressed={range === "7d"}
          >
            7 días
          </button>
          <button
            type="button"
            className={`profe-dashboard__range-btn${range === "30d" ? " is-active" : ""}`}
            onClick={() => setRange("30d")}
            aria-pressed={range === "30d"}
          >
            30 días
          </button>
        </div>
      </div>

      <div className="profe-dashboard__chart-canvas">
        {isEmpty ? (
          <p className="profe-dashboard__chart-empty" aria-live="polite">
            Sin entrenamientos completados en este período.
          </p>
        ) : null}

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey={(point: Point) => labelFor(point, range)}
              tick={{ fill: TICK_FILL, fontSize: 11 }}
              axisLine={{ stroke: AXIS_STROKE }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={{ stroke: AXIS_STROKE }}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(245 197 24 / 8%)" }} />
            <Bar
              dataKey="completados"
              fill={BAR_FILL}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
