"use client";

import { memo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Medicion } from "@/features/profe/types/medicion";
import type { MetodoCalculo } from "@/features/profe/types/medicion";
import type { Sexo } from "@/types/usuario";
import {
  formatGrasaCorporal,
  formatMedicionDateShort,
} from "@/features/profe/utils/pliegues-period";

const AXIS_STROKE = "rgb(91 155 213 / 55%)";
const GRID_STROKE = "rgb(91 155 213 / 22%)";
const TICK_FILL = "rgb(163 163 163)";

const JP3_MUJER = [
  { key: "tricipital", label: "Tríceps", color: "#f5c518" },
  { key: "suprailiaco", label: "Suprailíaco", color: "#5b9bd5" },
  { key: "muslo", label: "Muslo", color: "#ffc000" },
] as const;

const JP3_HOMBRE = [
  { key: "pectoral", label: "Pectoral", color: "#f5c518" },
  { key: "abdominal", label: "Abdomen", color: "#5b9bd5" },
  { key: "muslo", label: "Muslo", color: "#ffc000" },
] as const;

const JP7_SERIES = [
  { key: "pectoral", label: "Pectoral", color: "#f5c518" },
  { key: "axilarMedia", label: "Axilar", color: "#e8a838" },
  { key: "tricipital", label: "Tríceps", color: "#5b9bd5" },
  { key: "subescapular", label: "Subesc.", color: "#7eb8e8" },
  { key: "abdominal", label: "Abdomen", color: "#ffc000" },
  { key: "suprailiaco", label: "Suprail.", color: "#c9a227" },
  { key: "muslo", label: "Muslo", color: "#9ec5e8" },
] as const;

const NAVY_MUJER = [
  { key: "cuelloCm", label: "Cuello", color: "#f5c518" },
  { key: "cinturaCm", label: "Cintura", color: "#5b9bd5" },
  { key: "caderaCm", label: "Cadera", color: "#ffc000" },
] as const;

const NAVY_HOMBRE = [
  { key: "cuelloCm", label: "Cuello", color: "#f5c518" },
  { key: "cinturaCm", label: "Cintura", color: "#5b9bd5" },
] as const;

const axisLineStyle = {
  stroke: AXIS_STROKE,
  strokeWidth: 2,
  markerEnd: "url(#pliegues-axis-arrow)",
};

type ChartPoint = Record<string, string | number | null>;

type PlieguesHistoryChartProps = {
  mediciones: Medicion[];
  sexo: Sexo;
  metodo: MetodoCalculo;
};

function getSeries(metodo: MetodoCalculo, sexo: Sexo) {
  if (metodo === "jp7") return JP7_SERIES;
  if (metodo === "us-navy") {
    return sexo === "mujer" ? NAVY_MUJER : NAVY_HOMBRE;
  }
  return sexo === "mujer" ? JP3_MUJER : JP3_HOMBRE;
}

function buildChartData(
  mediciones: Medicion[],
  metodo: MetodoCalculo,
): ChartPoint[] {
  return mediciones.map((medicion) => {
    const base: ChartPoint = {
      fechaLabel: formatMedicionDateShort(medicion.fecha),
      porcentajeGrasaCorporal: medicion.metricas.porcentajeGrasaCorporal,
    };

    if (metodo === "us-navy") {
      const c = medicion.circunferencias ?? {};
      return {
        ...base,
        cuelloCm: c.cuelloCm ?? null,
        cinturaCm: c.cinturaCm ?? null,
        caderaCm: c.caderaCm ?? null,
      };
    }

    const p = medicion.pliegues ?? {};
    if (metodo === "jp7") {
      return {
        ...base,
        pectoral: p.pectoral ?? null,
        axilarMedia: p.axilarMedia ?? null,
        tricipital: p.tricipital ?? null,
        subescapular: p.subescapular ?? null,
        abdominal: p.abdominal ?? null,
        suprailiaco: p.suprailiaco ?? null,
        muslo: p.muslo ?? null,
      };
    }

    return {
      ...base,
      tricipital: p.tricipital ?? null,
      suprailiaco: p.suprailiaco ?? null,
      pectoral: p.pectoral ?? null,
      abdominal: p.abdominal ?? null,
      muslo: p.muslo ?? null,
    };
  });
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | null;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

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
                : typeof entry.value === "number"
                  ? `${entry.value.toLocaleString("es-UY")} ${unit}`
                  : "—"}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const PlieguesHistoryChart = memo(function PlieguesHistoryChart({
  mediciones,
  sexo,
  metodo,
}: PlieguesHistoryChartProps) {
  const series = getSeries(metodo, sexo);
  const chartData = buildChartData(mediciones, metodo);
  const isEmpty = mediciones.length === 0;
  const valueUnit = metodo === "us-navy" ? "cm" : "mm";

  return (
    <section
      className={`pliegues-chart${isEmpty ? " pliegues-chart--empty" : ""}`}
    >
      <h2>Evolución</h2>
      <div
        className="pliegues-chart__canvas"
        aria-label="Gráfica de composición corporal"
      >
        {isEmpty ? (
          <p className="pliegues-chart__empty-overlay" aria-live="polite">
            No hay mediciones de este método en el período seleccionado.
          </p>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 4, bottom: 24 }}
          >
            <defs>
              <marker
                id="pliegues-axis-arrow"
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
              yAxisId="values"
              unit={` ${valueUnit}`}
              domain={isEmpty ? [0, 40] : ["auto", "auto"]}
              allowDecimals
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={axisLineStyle}
              tickLine={{ stroke: AXIS_STROKE }}
              width={48}
            />
            <YAxis
              yAxisId="grasa"
              orientation="right"
              unit="%"
              domain={isEmpty ? [0, 40] : ["auto", "auto"]}
              allowDecimals
              tick={{ fill: TICK_FILL, fontSize: 12 }}
              axisLine={axisLineStyle}
              tickLine={{ stroke: AXIS_STROKE }}
              width={48}
            />
            <Tooltip content={<ChartTooltip unit={valueUnit} />} />
            <Legend
              iconType="plainline"
              iconSize={20}
              wrapperStyle={{
                color: "rgb(245 245 245)",
                fontSize: "0.85rem",
                paddingTop: "0.5rem",
              }}
            />
            {series.map((item) => (
              <Line
                key={item.key}
                yAxisId="values"
                type="linear"
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={3.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
            <Line
              yAxisId="grasa"
              type="linear"
              dataKey="porcentajeGrasaCorporal"
              name="% grasa"
              stroke="#7eb8e8"
              strokeWidth={3.5}
              strokeDasharray="8 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
});
