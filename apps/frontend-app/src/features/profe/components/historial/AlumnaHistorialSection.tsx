"use client";
import { useState } from "react";
import { FeedbackModal } from "@/components/FeedbackModal";

import { Button } from "@/components";
import { AlumnaFotosEvolucion } from "@/features/profe/components/historial/AlumnaFotosEvolucion";
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
  const [fotosRefresh, setFotosRefresh] = useState(0);

  return (
    <section className="alumna-detail-section alumna-historial">
      <div className="alumna-detail-section__header">
        <div>
          <h2>Historial</h2>
          <p>Evolución en fotos y actividad de la alumna.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            refetch();
            setFotosRefresh((value) => value + 1);
          }}
          disabled={loading}
        >
          Actualizar
        </Button>
      </div>

      <AlumnaFotosEvolucion alumnaId={alumnaId} refreshToken={fotosRefresh} />

      <h3 className="alumna-historial__block-title">Actividad</h3>
      <p className="alumna-historial__block-copy">
        Ordenada de la más reciente a la más antigua.
      </p>

      <AlumnaHistorialFilters
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <FeedbackModal message={error} />

      <AlumnaHistorialTimeline
        events={events}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
      />
    </section>
  );
}
