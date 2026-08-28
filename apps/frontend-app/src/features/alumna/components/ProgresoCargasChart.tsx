"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EjercicioCargaSeries } from "@/features/alumna/lib/progreso-charts";

const AXIS_STROKE = "rgb(91 155 213 / 55%)";
const GRID_STROKE = "rgb(91 155 213 / 22%)";
const TICK_FILL = "rgb(163 163 163)";
const LINE_STROKE = "#f5c518";

type ProgresoCargasChartProps = {
  series: EjercicioCargaSeries[];
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
    <div className="progreso-chart-tooltip">
      <p className="progreso-chart-tooltip__title">{label}</p>
      <p>{payload[0]?.value ?? 0} kg (máx. por serie)</p>
    </div>
  );
}

export const ProgresoCargasChart = memo(function ProgresoCargasChart({ series }: ProgresoCargasChartProps) {
  const [selectedEjercicioId, setSelectedEjercicioId] = useState<string>("");

  useEffect(() => {
    if (series.length === 0) {
      setSelectedEjercicioId("");
      return;
    }

    const stillExists = series.some(
      (item) => item.ejercicioId === selectedEjercicioId,
    );
    if (!stillExists) {
      const first = series[0];
      if (first) setSelectedEjercicioId(first.ejercicioId);
    }
  }, [selectedEjercicioId, series]);

  const selectedSeries = useMemo(
    () => series.find((item) => item.ejercicioId === selectedEjercicioId),
    [selectedEjercicioId, series],
  );

  const chartData = useMemo(
    () =>
      (selectedSeries?.puntos ?? []).map((point) => ({
        label: point.label,
        pesoMax: point.pesoMax,
      })),
    [selectedSeries],
  );

  const isEmpty = series.length === 0;

  return (
    <section
      className={`progreso-chart feature-card glass-surface glass-surface--elevated${isEmpty ? " progreso-chart--empty" : ""}`}
    >
      <div className="progreso-chart__header">
        <h2>Progresión de cargas</h2>
        {!isEmpty ? (
          <label className="progreso-chart__select">
            <span>Ejercicio</span>
            <select
              value={selectedEjercicioId}
              onChange={(event) => setSelectedEjercicioId(event.target.value)}
              aria-label="Ejercicio"
            >
              {series.map((item) => (
                <option key={item.ejercicioId} value={item.ejercicioId}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="progreso-chart__canvas">
        {isEmpty ? (
          <p className="progreso-chart__empty" aria-live="polite">
            Registrá pesos durante tu rutina para ver tu progresión.
          </p>
        ) : null}

        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: TICK_FILL, fontSize: 11 }}
              axisLine={{ stroke: AXIS_STROKE }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              unit=" kg"
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={{ stroke: AXIS_STROKE }}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="pesoMax"
              stroke={LINE_STROKE}
              strokeWidth={2.5}
              dot={{ r: 4, fill: LINE_STROKE }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
});
