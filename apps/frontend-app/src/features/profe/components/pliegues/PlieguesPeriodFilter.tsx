"use client";

import {
  PLIEGUES_PERIOD_OPTIONS,
  type PlieguesPeriod,
} from "@/features/profe/utils/pliegues-period";

type PlieguesPeriodFilterProps = {
  value: PlieguesPeriod;
  onChange: (period: PlieguesPeriod) => void;
};

export function PlieguesPeriodFilter({
  value,
  onChange,
}: PlieguesPeriodFilterProps) {
  return (
    <div
      className="pliegues-period-filter"
      role="group"
      aria-label="Filtrar por período"
    >
      {PLIEGUES_PERIOD_OPTIONS.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={`pliegues-period-filter__chip${isActive ? " pliegues-period-filter__chip--active" : ""}`}
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
