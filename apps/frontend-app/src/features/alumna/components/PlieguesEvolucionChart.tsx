"use client";

import { memo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartTypeToggle,
  type ChartKind,
} from "@/features/profe/components/pliegues/ChartTypeToggle";
import type { Medicion } from "@/features/profe/types/medicion";
import {
  formatGrasaCorporal,
  formatMedicionDateShort,
} from "@/features/profe/utils/pliegues-period";

const AXIS_STROKE = "rgb(91 155 213 / 55%)";
const GRID_STROKE = "rgb(91 155 213 / 22%)";
const TICK_FILL = "rgb(163 163 163)";
const GRASA_COLOR = "#7eb8e8";
const PESO_COLOR = "#fdc915";

const axisLineStyle = {
  stroke: AXIS_STROKE,
  strokeWidth: 2,
  markerEnd: "url(#pliegues-evolucion-axis-arrow)",
};

type ChartPoint = {
  fechaLabel: string;
  porcentajeGrasaCorporal: number | null;
  pesoCorporalKg: number | null;
};

function formatPeso(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("es-UY", { maximumFractionDigits: 1 })} kg`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | null;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="pliegues-chart-tooltip">
      <p className="pliegues-chart-tooltip__title">{label}</p>
      <ul className="pliegues-chart-tooltip__list">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name}>
            <span
              className="pliegues-chart-tooltip__dot"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span>{entry.name}</span>
            <strong>
              {entry.dataKey === "porcentajeGrasaCorporal"
                ? formatGrasaCorporal(
                    typeof entry.value === "number" ? entry.value : null,
                  )
                : formatPeso(typeof entry.value === "number" ? entry.value : null)}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvolucionSeries({
  kind,
  hasPeso,
  showDots,
}: {
  kind: ChartKind;
  hasPeso: boolean;
  showDots: boolean;
}) {
  if (kind === "bar") {
    return (
      <>
        <Bar
          yAxisId="grasa"
          dataKey="porcentajeGrasaCorporal"
          name="% grasa"
          fill={GRASA_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={22}
        />
        {hasPeso ? (
          <Bar
            yAxisId="peso"
            dataKey="pesoCorporalKg"
            name="Peso"
            fill={PESO_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        ) : null}
      </>
    );
  }

  if (kind === "area") {
    return (
      <>
        <Area
          yAxisId="grasa"
          type="monotone"
          dataKey="porcentajeGrasaCorporal"
          name="% grasa"
          stroke={GRASA_COLOR}
          strokeWidth={2.5}
          fill={GRASA_COLOR}
          fillOpacity={0.22}
          dot={showDots ? { r: 3, strokeWidth: 0 } : false}
          activeDot={{ r: 5, strokeWidth: 0 }}
          connectNulls
        />
        {hasPeso ? (
          <Area
            yAxisId="peso"
            type="monotone"
            dataKey="pesoCorporalKg"
            name="Peso"
            stroke={PESO_COLOR}
            strokeWidth={2.5}
            fill={PESO_COLOR}
            fillOpacity={0.16}
            dot={showDots ? { r: 3, strokeWidth: 0 } : false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Line
        yAxisId="grasa"
        type="monotone"
        dataKey="porcentajeGrasaCorporal"
        name="% grasa"
        stroke={GRASA_COLOR}
        strokeWidth={3.5}
        dot={showDots ? { r: 4, strokeWidth: 0 } : false}
        activeDot={{ r: 5, strokeWidth: 0 }}
        connectNulls
      />
      {hasPeso ? (
        <Line
          yAxisId="peso"
          type="monotone"
          dataKey="pesoCorporalKg"
          name="Peso"
          stroke={PESO_COLOR}
          strokeWidth={3.5}
          strokeDasharray="8 4"
          dot={showDots ? { r: 4, strokeWidth: 0 } : false}
          activeDot={{ r: 5, strokeWidth: 0 }}
          connectNulls
        />
      ) : null}
    </>
  );
}

export const PlieguesEvolucionChart = memo(function PlieguesEvolucionChart({
  mediciones,
}: {
  mediciones: Medicion[];
}) {
  const [chartKind, setChartKind] = useState<ChartKind>("line");
  const hasPeso = mediciones.some((medicion) => medicion.pesoCorporalKg != null);
  const chartData: ChartPoint[] = mediciones.map((medicion) => ({
    fechaLabel: formatMedicionDateShort(medicion.fecha),
    porcentajeGrasaCorporal: medicion.metricas?.porcentajeGrasaCorporal ?? null,
    pesoCorporalKg: medicion.pesoCorporalKg ?? null,
  }));
  const showDots = chartData.length < 2;
  const ChartFrame =
    chartKind === "bar" ? BarChart : chartKind === "area" ? AreaChart : LineChart;
  const legendIcon =
    chartKind === "bar" ? "rect" : chartKind === "area" ? "square" : "plainline";

  return (
    <section className="pliegues-chart">
      <div className="pliegues-chart__head">
        <div className="pliegues-chart__copy">
          <h2>Grasa corporal</h2>
          <p className="pliegues-chart__hint">
            Porcentaje de grasa de cada medición de pliegues
            {hasPeso ? ", junto con el peso de ese control" : ""}.
          </p>
        </div>
        <ChartTypeToggle value={chartKind} onChange={setChartKind} />
      </div>
      <div
        className="pliegues-chart__canvas"
        aria-label="Gráfica de grasa corporal"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ChartFrame
            key={chartKind}
            data={chartData}
            margin={{ top: 12, right: hasPeso ? 8 : 16, left: 4, bottom: 8 }}
          >
            <defs>
              <marker
                id="pliegues-evolucion-axis-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="rgb(91 155 213 / 70%)" />
              </marker>
            </defs>
            <CartesianGrid stroke={GRID_STROKE} vertical horizontal />
            <XAxis
              dataKey="fechaLabel"
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={axisLineStyle}
              tickLine={{ stroke: AXIS_STROKE }}
            />
            <YAxis
              yAxisId="grasa"
              unit="%"
              domain={["auto", "auto"]}
              allowDecimals
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={axisLineStyle}
              tickLine={{ stroke: AXIS_STROKE }}
              width={48}
            />
            {hasPeso ? (
              <YAxis
                yAxisId="peso"
                orientation="right"
                unit=" kg"
                domain={["auto", "auto"]}
                allowDecimals
                tick={{ fill: TICK_FILL, fontSize: 12 }}
                axisLine={axisLineStyle}
                tickLine={{ stroke: AXIS_STROKE }}
                width={56}
              />
            ) : null}
            <Tooltip content={<ChartTooltip />} />
            <Legend
              iconType={legendIcon}
              iconSize={20}
              wrapperStyle={{ fontSize: "0.85rem", paddingTop: "0.5rem" }}
            />
            <EvolucionSeries
              kind={chartKind}
              hasPeso={hasPeso}
              showDots={showDots}
            />
          </ChartFrame>
        </ResponsiveContainer>
      </div>
    </section>
  );
});
