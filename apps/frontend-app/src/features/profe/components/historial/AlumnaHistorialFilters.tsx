"use client";

import { Button } from "@/components";
import {
  HISTORIAL_CATEGORIA_OPTIONS,
  type AlumnaHistorialFilters,
  type HistorialCategoria,
} from "@/features/profe/types/historial";

type AlumnaHistorialFiltersProps = {
  filters: AlumnaHistorialFilters;
  onChange: (next: AlumnaHistorialFilters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function AlumnaHistorialFilters({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
}: AlumnaHistorialFiltersProps) {
  return (
    <section className="alumna-historial-filters">
      <div className="alumna-historial-filters__grid">
        <label className="field" htmlFor="historial-filter-categoria">
          <span className="field__label">Categoría</span>
          <select
            id="historial-filter-categoria"
            className="field__input"
            value={filters.categoria ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                categoria: event.target.value
                  ? (event.target.value as HistorialCategoria)
                  : undefined,
              })
            }
          >
            {HISTORIAL_CATEGORIA_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field" htmlFor="historial-filter-desde">
          <span className="field__label">Desde</span>
          <input
            id="historial-filter-desde"
            className="field__input"
            type="date"
            value={filters.desde ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                desde: event.target.value || undefined,
              })
            }
          />
        </label>

        <label className="field" htmlFor="historial-filter-hasta">
          <span className="field__label">Hasta</span>
          <input
            id="historial-filter-hasta"
            className="field__input"
            type="date"
            value={filters.hasta ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                hasta: event.target.value || undefined,
              })
            }
          />
        </label>

        <label className="field" htmlFor="historial-filter-q">
          <span className="field__label">Buscar</span>
          <input
            id="historial-filter-q"
            className="field__input"
            type="search"
            placeholder="Buscar en el historial…"
            value={filters.q ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                q: event.target.value,
              })
            }
          />
        </label>
      </div>

      {hasActiveFilters ? (
        <div className="alumna-historial-filters__actions">
          <Button type="button" variant="ghost" onClick={onClear}>
            Limpiar filtros
          </Button>
        </div>
      ) : null}
    </section>
  );
}
