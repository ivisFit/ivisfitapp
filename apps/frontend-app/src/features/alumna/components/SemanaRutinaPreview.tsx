"use client";

import type { ChallengeDay } from "@/features/alumna/lib/rutina-day";
import { formatSeriesReps } from "@/lib/rutina-reps";

type SemanaRutinaPreviewProps = {
  days: ChallengeDay[];
  onOpenDay: (day: ChallengeDay) => void;
};

function formatDayDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("es-UY", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function SemanaRutinaPreview({ days, onOpenDay }: SemanaRutinaPreviewProps) {
  if (days.length === 0) return null;

  return (
    <section className="semana-preview" aria-label="Esta semana">
      <div className="semana-preview__head">
        <h2>Esta semana</h2>
        <p>Podés mirar los días que vienen. Entrenás cuando llega la fecha.</p>
      </div>
      <ol className="semana-preview__days">
        {days.map((day) => {
          const preview = Boolean(day.preview && day.state === "locked");
          return (
            <li key={day.dateKey}>
              <button
                type="button"
                className={`semana-preview__day${day.isToday ? " is-today" : ""}${
                  preview ? " is-preview" : ""
                }`}
                onClick={() => onOpenDay(day)}
              >
                <span className="semana-preview__meta">
                  <strong>{day.title}</strong>
                  <span>{formatDayDate(day.dateKey)}</span>
                  {preview ? <span className="semana-preview__badge">Vista previa</span> : null}
                  {day.isToday ? <span className="semana-preview__badge">Hoy</span> : null}
                </span>
                {day.ejercicios.length > 0 ? (
                  <ul className="semana-preview__exercises">
                    {day.ejercicios.map((ejercicio, index) => (
                      <li key={`${ejercicio.id}-${index}`}>
                        <span>{ejercicio.nombre}</span>
                        <span>
                          {formatSeriesReps(
                            ejercicio.series,
                            ejercicio.repeticiones,
                            ejercicio.repeticionesPorSerie,
                            "x",
                            ejercicio.unidad,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="semana-preview__empty">Sin ejercicios cargados.</p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
