import {
  buildExerciseViews,
  dayStatusLabels,
  formatPesosLabel,
  formatSeguimientoDayDateLabel,
  type SeguimientoDayView,
} from "@/features/profe/lib/seguimiento";

type SeguimientoDayPanelProps = {
  dayView: SeguimientoDayView;
  pesosBySlot: Record<string, number[]>;
  defaultOpen?: boolean;
};

export function SeguimientoDayPanel({
  dayView,
  pesosBySlot,
  defaultOpen = false,
}: SeguimientoDayPanelProps) {
  const { day, status, completedExerciseCount, totalExerciseCount } = dayView;
  const exercises = buildExerciseViews(dayView, pesosBySlot);

  return (
    <article className={`seguimiento-day-row seguimiento-day-row--${status}`}>
      <div className="seguimiento-day__rail" aria-hidden="true">
        <span className="seguimiento-day__node" />
      </div>

      <details
        className={`seguimiento-day seguimiento-day--${status}`}
        open={defaultOpen}
      >
        <summary className="seguimiento-day__summary">
          <span className="seguimiento-day__meta">
            <span className="seguimiento-day__number">Día {day.dayNumber}</span>
            <span
              className={`seguimiento-day__date${
                status !== "completado" ? " seguimiento-day__date--pending" : ""
              }`}
            >
              {formatSeguimientoDayDateLabel(dayView)}
            </span>
          </span>
          <span className="seguimiento-day__status">
            <span
              className={`seguimiento-day__badge seguimiento-day__badge--${status}`}
            >
              {dayStatusLabels[status]}
            </span>
            <span className="seguimiento-day__progress">
              {completedExerciseCount}/{totalExerciseCount} ejercicios
            </span>
          </span>
        </summary>

        <div className="seguimiento-day__body">
          {exercises.length > 0 ? (
            <ul className="seguimiento-exercises">
              {exercises.map((ejercicio) => (
                <li
                  key={ejercicio.id}
                  className={
                    ejercicio.completado
                      ? "seguimiento-exercises__item is-completed"
                      : "seguimiento-exercises__item"
                  }
                >
                  <span
                    className="seguimiento-exercises__check"
                    aria-label={ejercicio.completado ? "Completado" : "Pendiente"}
                  >
                    {ejercicio.completado ? "✓" : ""}
                  </span>
                  <div className="seguimiento-exercises__copy">
                    <strong>{ejercicio.nombre}</strong>
                    <span>
                      {ejercicio.series} x {ejercicio.repeticiones} · Descanso{" "}
                      {ejercicio.descansoSegundos}s
                    </span>
                  </div>
                  <span
                    className={
                      ejercicio.pesosPorSerie.length > 0
                        ? "seguimiento-exercises__pesos"
                        : "seguimiento-exercises__pesos is-empty"
                    }
                  >
                    {formatPesosLabel(ejercicio.pesosPorSerie)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="seguimiento-day__empty">
              Este día no tiene ejercicios cargados.
            </p>
          )}
        </div>
      </details>
    </article>
  );
}
