"use client";

import { Button } from "@/components";
import { AlumnaHistorialFilters } from "@/features/profe/components/historial/AlumnaHistorialFilters";
import { AlumnaHistorialTimeline } from "@/features/profe/components/historial/AlumnaHistorialTimeline";
import { useAlumnaHistorial } from "@/features/profe/hooks/useAlumnaHistorial";

type AlumnaHistorialSectionProps = {
  alumnaId: string;
};

export function AlumnaHistorialSection({ alumnaId }: AlumnaHistorialSectionProps) {
  const {
    events,
    filters,
    setFilters,
    loading,
    error,
    refetch,
    clearFilters,
    hasActiveFilters,
  } = useAlumnaHistorial(alumnaId);

  return (
    <section className="alumna-detail-section alumna-historial">
      <div className="alumna-detail-section__header">
        <div>
          <h2>Historial</h2>
          <p>Actividad de la alumna ordenada de la más reciente a la más antigua.</p>
        </div>
        <Button type="button" variant="ghost" onClick={refetch} disabled={loading}>
          Actualizar
        </Button>
      </div>

      <AlumnaHistorialFilters
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {error ? <p className="auth-error">{error}</p> : null}

      <AlumnaHistorialTimeline
        events={events}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
      />
    </section>
  );
}
