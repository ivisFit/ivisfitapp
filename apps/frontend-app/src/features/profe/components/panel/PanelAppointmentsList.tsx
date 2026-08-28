"use client";

import { memo } from "react";
import { CalendarClock } from "lucide-react";
import type { PanelAppointmentItem } from "@/features/profe/types/panel";
import { formatAppointmentTime } from "@/features/profe/utils/panel-format";

type PanelAppointmentsListProps = {
  items: PanelAppointmentItem[];
};

export const PanelAppointmentsList = memo(function PanelAppointmentsList({ items }: PanelAppointmentsListProps) {
  return (
    <section className="profe-dashboard__card glass-surface glass-surface--elevated">
      <h2 className="profe-dashboard__card-title">Próximos inicios</h2>

      {items.length === 0 ? (
        <div className="profe-dashboard__empty-state">
          <CalendarClock size={22} strokeWidth={1.5} aria-hidden />
          <p className="profe-dashboard__empty">
            No hay inicios de planes programados para las próximas 2 semanas.
          </p>
        </div>
      ) : (
        <ul className="profe-dashboard__appointments-list">
          {items.map((item) => (
            <li key={item.id} className="profe-dashboard__appointment-item">
              <span className="profe-dashboard__appointment-title">
                {item.titulo}
              </span>
              <time
                className="profe-dashboard__appointment-time"
                dateTime={item.fechaHora}
              >
                {formatAppointmentTime(item.fechaHora)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});
