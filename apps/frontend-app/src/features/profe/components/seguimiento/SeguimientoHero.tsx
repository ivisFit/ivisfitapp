import { memo, type CSSProperties } from "react";
import type { SeguimientoStats } from "@/features/profe/lib/seguimiento";

type SeguimientoHeroProps = {
  stats: SeguimientoStats;
};

export const SeguimientoHero = memo(function SeguimientoHero({
  stats,
}: SeguimientoHeroProps) {
  return (
    <section className="seguimiento-hero" aria-label="Resumen de seguimiento">
      <div className="seguimiento-hero__summary">
        <div className="seguimiento-hero__stats" aria-label="Estadísticas del plan">
          <article>
            <span>Día actual</span>
            <strong>
              {stats.currentDayNumber}
              <small>{stats.currentDayTitle}</small>
            </strong>
          </article>
          <article>
            <span>Días completos</span>
            <strong>{stats.completedDays}</strong>
          </article>
          <article>
            <span>Total del plan</span>
            <strong>{stats.totalDays}</strong>
          </article>
          <article>
            <span>Días activos</span>
            <strong>{stats.activeDays}</strong>
          </article>
        </div>

        <div
          className="seguimiento-hero__ring"
          style={
            { "--seguimiento-progress": `${stats.progressPercent}%` } as CSSProperties
          }
          aria-label={`${stats.progressPercent}% del plan completado`}
        >
          <strong>{stats.progressPercent}%</strong>
          <span>avance</span>
        </div>
      </div>
    </section>
  );
});
