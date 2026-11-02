"use client";

export type ChartKind = "line" | "bar" | "area";

const CHART_KIND_OPTIONS: { id: ChartKind; label: string }[] = [
  { id: "line", label: "Línea" },
  { id: "bar", label: "Barras" },
  { id: "area", label: "Área" },
];

type ChartTypeToggleProps = {
  value: ChartKind;
  onChange: (kind: ChartKind) => void;
};

export function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  return (
    <div
      className="pliegues-period-filter"
      role="group"
      aria-label="Tipo de gráfica"
    >
      {CHART_KIND_OPTIONS.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={`pliegues-period-filter__chip${
              isActive ? " pliegues-period-filter__chip--active" : ""
            }`}
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
