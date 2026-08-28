"use client";

import type { MetodoCalculo } from "@/features/profe/types/medicion";
import {
  METODO_CALCULO_OPTIONS,
  getMetodoDescription,
} from "@/features/profe/utils/pliegues-period";

type MetodoCalculoSelectorProps = {
  value: MetodoCalculo;
  onChange: (metodo: MetodoCalculo) => void;
  disabled?: boolean;
};

export function MetodoCalculoSelector({
  value,
  onChange,
  disabled = false,
}: MetodoCalculoSelectorProps) {
  return (
    <div className="pliegues-method-block">
      <div
        className="pliegues-method-filter"
        role="group"
        aria-label="Método de cálculo de grasa corporal"
      >
        {METODO_CALCULO_OPTIONS.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              className={`pliegues-period-filter__chip pliegues-method-filter__chip${isActive ? " pliegues-period-filter__chip--active" : ""}`}
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => onChange(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="pliegues-method-block__hint">{getMetodoDescription(value)}</p>
    </div>
  );
}
