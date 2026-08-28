"use client";

import Link from "next/link";
import { useCoachInsights } from "@/features/alumna/hooks/useCoachInsights";
import type { CoachInsightTipo } from "@/features/alumna/types/coach-insight";
import { alumnaRoutes } from "@/routes/paths";

const ICONS: Partial<Record<CoachInsightTipo, string>> = {
  nuevo_record: "🏆",
  racha_positiva: "🎉",
  desafio_semanal: "🎯",
  alimentacion_baja: "🍎",
  sin_plan_alimentacion: "🍎",
  dias_sin_entrenar: "💪",
  cumplimiento_bajo: "💪",
  nota_coach: "💬",
  plan_publicado: "🥗",
  rutina_asignada: "🏋️",
};

function hrefForInsight(tipo: CoachInsightTipo): string | null {
  switch (tipo) {
    case "alimentacion_baja":
    case "sin_plan_alimentacion":
    case "plan_publicado":
      return alumnaRoutes.alimentacion;
    case "dias_sin_entrenar":
    case "cumplimiento_bajo":
    case "rutina_asignada":
    case "desafio_semanal":
      return alumnaRoutes.rutina;
    case "nota_coach":
      return alumnaRoutes.mensajes;
    case "nuevo_record":
    case "racha_positiva":
      return alumnaRoutes.logros;
    case "medicion_pendiente":
      return alumnaRoutes.circunferencias;
    case "peso_estancado":
      return alumnaRoutes.progreso;
    default:
      return null;
  }
}

export function CoachInsightBanner() {
  const { insight, dismiss } = useCoachInsights();

  if (!insight) return null;

  const accionHref = hrefForInsight(insight.tipo);

  return (
    <div className={`coach-insight-banner coach-insight-banner--${insight.tipo}`}>
      <span className="coach-insight-banner__icon" aria-hidden>
        {ICONS[insight.tipo] ?? "✨"}
      </span>
      <div className="coach-insight-banner__content">
        <p className="coach-insight-banner__mensaje">{insight.mensaje}</p>
        {insight.accionSugerida && accionHref ? (
          <Link href={accionHref} className="coach-insight-banner__accion">
            {insight.accionSugerida}
          </Link>
        ) : insight.accionSugerida ? (
          <p className="coach-insight-banner__accion">{insight.accionSugerida}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="coach-insight-banner__close"
        onClick={() => void dismiss()}
        aria-label="Descartar"
      >
        ×
      </button>
    </div>
  );
}
