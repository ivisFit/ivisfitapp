import { memo } from "react";
import type { SeguimientoDayView } from "@/features/profe/lib/seguimiento";
import { SeguimientoDayPanel } from "./SeguimientoDayPanel";

type SeguimientoDayTimelineProps = {
  dayViews: SeguimientoDayView[];
  pesosBySlot: Record<string, number[]>;
};

export const SeguimientoDayTimeline = memo(function SeguimientoDayTimeline({
  dayViews,
  pesosBySlot,
}: SeguimientoDayTimelineProps) {
  if (dayViews.length === 0) {
    return (
      <p className="alumnas-panel__status">
        Este plan todavía no tiene días cargados.
      </p>
    );
  }

  const todayIndex = dayViews.findIndex((view) => view.day.isToday);

  return (
    <section className="seguimiento-timeline" aria-label="Detalle día a día">
      <header className="seguimiento-timeline__header">
        <h2>Detalle por día</h2>
        <p>Expandí cada jornada para ver ejercicios, cumplimiento y pesos.</p>
      </header>

      <div className="seguimiento-timeline__list">
        {dayViews.map((dayView, index) => (
          <SeguimientoDayPanel
            key={dayView.day.dateKey}
            dayView={dayView}
            pesosBySlot={pesosBySlot}
            defaultOpen={index === todayIndex}
          />
        ))}
      </div>
    </section>
  );
});
