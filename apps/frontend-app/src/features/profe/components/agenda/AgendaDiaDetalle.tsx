"use client";

import { Button } from "@/components";
import {
  formatReunionDate,
  getReunionDateKey,
  type Reunion,
} from "@/features/profe/types/reunion";

type AgendaDiaDetalleProps = {
  dateKey: string | null;
  reuniones: Reunion[];
  actionId: string | null;
  onAdd: () => void;
  onEdit: (reunion: Reunion) => void;
  onDelete: (reunion: Reunion) => void;
};

export function AgendaDiaDetalle({
  dateKey,
  reuniones,
  actionId,
  onAdd,
  onEdit,
  onDelete,
}: AgendaDiaDetalleProps) {
  if (!dateKey) {
    return (
      <section className="agenda-dia-detalle agenda-dia-detalle--empty">
        <p className="alumnas-panel__status">
          Seleccioná un día del calendario para ver o agendar reuniones.
        </p>
      </section>
    );
  }

  const dayReuniones = reuniones
    .filter((reunion) => getReunionDateKey(reunion.fecha) === dateKey)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const dateLabel = formatReunionDate(dateKey);

  return (
    <section className="agenda-dia-detalle">
      <div className="agenda-dia-detalle__header">
        <div>
          <h3>Reuniones del día</h3>
          <p className="agenda-dia-detalle__date">{dateLabel}</p>
        </div>
        <Button type="button" onClick={onAdd}>
          Agregar reunión
        </Button>
      </div>

      {dayReuniones.length === 0 ? (
        <p className="alumnas-panel__status">
          No hay reuniones agendadas para este día.
        </p>
      ) : (
        <ul className="agenda-dia-detalle__list">
          {dayReuniones.map((reunion) => {
            const isProcessing = actionId === reunion.id;

            return (
              <li key={reunion.id} className="agenda-dia-detalle__item">
                <div>
                  <p className="agenda-dia-detalle__time">{reunion.hora}</p>
                  <h4>{reunion.titulo}</h4>
                  <p className="agenda-dia-detalle__alumna">
                    {reunion.alumna?.nombre ?? "Alumna"}
                  </p>
                  {reunion.descripcion ? (
                    <p className="agenda-dia-detalle__descripcion">
                      {reunion.descripcion}
                    </p>
                  ) : null}
                  <a
                    className="auth-link"
                    href={reunion.meetLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir Meet
                  </a>
                </div>
                <div className="agenda-dia-detalle__actions">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onEdit(reunion)}
                    disabled={isProcessing}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onDelete(reunion)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
