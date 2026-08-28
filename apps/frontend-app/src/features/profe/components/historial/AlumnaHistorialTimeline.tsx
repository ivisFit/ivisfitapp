"use client";

import { ListSkeleton } from "@/components/skeletons/AppSkeleton";
import {
  formatHistorialDate,
  HISTORIAL_CATEGORIA_LABELS,
  type AlumnaHistorialEvent,
} from "@/features/profe/types/historial";

type AlumnaHistorialTimelineProps = {
  events: AlumnaHistorialEvent[];
  loading: boolean;
  hasActiveFilters: boolean;
};

export function AlumnaHistorialTimeline({
  events,
  loading,
  hasActiveFilters,
}: AlumnaHistorialTimelineProps) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Cargando historial">
        <ListSkeleton items={4} />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="alumnas-panel__status alumnas-panel__status--empty">
        {hasActiveFilters
          ? "No hay eventos que coincidan con los filtros seleccionados."
          : "Todavía no hay actividad registrada para esta alumna."}
      </p>
    );
  }

  return (
    <ol className="alumna-historial__timeline">
      {events.map((event) => (
        <li key={event.id}>
          <span className="alumna-historial__dot" aria-hidden />
          <div className="alumna-historial__content">
            <div className="alumna-historial__meta">
              <span
                className={`alumna-historial__badge alumna-historial__badge--${event.categoria}`}
              >
                {HISTORIAL_CATEGORIA_LABELS[event.categoria]}
              </span>
              <time dateTime={event.ocurrioEn ?? undefined}>
                {formatHistorialDate(event.ocurrioEn)}
              </time>
            </div>
            <strong>{event.titulo}</strong>
            <p>{event.detalle}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
