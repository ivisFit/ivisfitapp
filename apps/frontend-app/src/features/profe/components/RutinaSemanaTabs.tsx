"use client";

import type { SemanaPlanDraft } from "@/features/profe/lib/rutina-draft";

type RutinaSemanaTabsProps = {
  semanas: SemanaPlanDraft[];
  activeWeek: number;
  onChange: (week: number) => void;
  isWeekComplete: (semana: SemanaPlanDraft) => boolean;
};

export function RutinaSemanaTabs({
  semanas,
  activeWeek,
  onChange,
  isWeekComplete,
}: RutinaSemanaTabsProps) {
  const activeIndex = semanas.findIndex((s) => s.numeroSemana === activeWeek);
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex >= 0 && activeIndex < semanas.length - 1;

  return (
    <div className="rutina-builder__semana-tabs" role="navigation" aria-label="Semanas del plan">
      <button
        type="button"
        className="rutina-builder__semana-nav"
        disabled={!canGoPrev}
        onClick={() => onChange(semanas[activeIndex - 1]?.numeroSemana ?? activeWeek)}
        aria-label="Semana anterior"
      >
        ←
      </button>

      <div className="rutina-builder__semana-tabs-scroll" role="tablist">
        {semanas.map((semana) => {
          const isActive = semana.numeroSemana === activeWeek;
          const complete = isWeekComplete(semana);
          return (
            <button
              key={semana.numeroSemana}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`rutina-builder__semana-tab${isActive ? " is-active" : ""}${
                complete ? " is-complete" : ""
              }`}
              onClick={() => onChange(semana.numeroSemana)}
            >
              <span>Semana {semana.numeroSemana}</span>
              <span className="rutina-builder__semana-tab-meta">
                {semana.dias.length} {semana.dias.length === 1 ? "día" : "días"}
                {complete ? (
                  <span className="rutina-builder__semana-tab-check" aria-label="Completa">
                    ✓
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="rutina-builder__semana-nav"
        disabled={!canGoNext}
        onClick={() => onChange(semanas[activeIndex + 1]?.numeroSemana ?? activeWeek)}
        aria-label="Semana siguiente"
      >
        →
      </button>
    </div>
  );
}
