"use client";

import { IvisContentLoader } from "@/components/IvisContentLoader";
import {
  formatCheckinDayLabel,
  listRecentDateKeys,
  useCheckinsAlimentacionSemana,
} from "@/features/alumna/hooks/useCheckinsAlimentacionSemana";
import type { CheckinAlimentacionEstado } from "@/features/alumna/types/checkin-alimentacion";

const ESTADO_LABEL: Record<CheckinAlimentacionEstado, string> = {
  cumpli: "Cumplí",
  parcial: "Parcial",
  no_pude: "No pude",
};

export function ProgresoCheckinsSemana() {
  const { checkins, loading, error, refetch } = useCheckinsAlimentacionSemana();
  const days = listRecentDateKeys(7);

  return (
    <section className="feature-card progreso-checkins" aria-labelledby="progreso-checkins-title">
      <div className="progreso-checkins__header">
        <h2 id="progreso-checkins-title">Alimentación de la semana</h2>
        <p>Cada día que marcás cómo te fue queda guardado en tu cuenta.</p>
      </div>

      {loading ? (
        <IvisContentLoader variant="section" label="Cargando check-ins" />
      ) : error ? (
        <div className="progreso-checkins__error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--ghost" onClick={refetch}>
            Reintentar
          </button>
        </div>
      ) : (
        <ol className="progreso-checkins__list">
          {days.map((dateKey) => {
            const checkin = checkins[dateKey];
            const label = checkin ? ESTADO_LABEL[checkin.estado] : "Sin registro";
            return (
              <li key={dateKey}>
                <span>{formatCheckinDayLabel(dateKey)}</span>
                <strong data-estado={checkin?.estado ?? "vacio"}>{label}</strong>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
