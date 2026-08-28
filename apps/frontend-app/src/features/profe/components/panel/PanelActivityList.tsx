"use client";

import { memo } from "react";
import { Inbox } from "lucide-react";
import type { PanelActivityItem } from "@/features/profe/types/panel";
import { ActivityJewel } from "@/features/profe/components/panel/ActivityJewel";
import { formatRelativeTime } from "@/features/profe/utils/panel-format";

type PanelActivityListProps = {
  items: PanelActivityItem[];
};

export const PanelActivityList = memo(function PanelActivityList({ items }: PanelActivityListProps) {
  return (
    <section className="profe-dashboard__card glass-surface glass-surface--elevated">
      <h2 className="profe-dashboard__card-title">Actividad Reciente</h2>

      {items.length === 0 ? (
        <div className="profe-dashboard__empty-state">
          <Inbox size={22} strokeWidth={1.5} aria-hidden />
          <p className="profe-dashboard__empty">
            Aún no hay actividad reciente. Los registros aparecerán acá.
          </p>
        </div>
      ) : (
        <ul className="profe-dashboard__activity-list">
          {items.map((item) => (
            <li key={item.id} className="profe-dashboard__activity-item">
              <ActivityJewel tipo={item.tipo} />
              <div className="profe-dashboard__activity-content">
                <p className="profe-dashboard__activity-title">{item.titulo}</p>
                <time
                  className="profe-dashboard__activity-time"
                  dateTime={item.ocurrioEn}
                >
                  {formatRelativeTime(item.ocurrioEn)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});
