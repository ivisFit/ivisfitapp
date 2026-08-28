"use client";

import { memo, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { ChallengeDay } from "@/features/alumna/lib/rutina-day";
import type { RutinaDetail } from "@/features/alumna/types/rutina";
import type {
  RutinaProgresoRecord,
  UpsertRutinaProgresoPayload,
} from "@/features/alumna/types/rutina-progreso";
import {
  ChallengeDaySheet,
  type SheetContainment,
} from "./ChallengeDaySheet";

type PlanDaysDashboardProps = {
  rutina: RutinaDetail;
  days: ChallengeDay[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ariaLabel?: string;
  sheetContainment?: SheetContainment;
  getDayProgreso?: (
    dateKey: string,
    numeroSemana?: number,
    nombreDia?: string,
  ) => RutinaProgresoRecord | undefined;
  upsertProgreso?: (
    payload: UpsertRutinaProgresoPayload,
  ) => Promise<RutinaProgresoRecord>;
};

function resolvePlanCopy(
  rutina: RutinaDetail,
  props: Pick<PlanDaysDashboardProps, "eyebrow" | "title" | "subtitle" | "ariaLabel">,
) {
  const plan = rutina.planTemplateSnapshot;
  const challenge = rutina.challenge28;
  const subtitleParts = [plan?.duracionLabel, plan?.inversion].filter(Boolean);
  const defaultSubtitle =
    subtitleParts.length > 0
      ? subtitleParts.join(" · ")
      : "Seguí tu rutina día a día.";

  return {
    eyebrow:
      props.eyebrow ??
      challenge?.accentLabel ??
      plan?.formato ??
      "Plan activo",
    title:
      props.title ?? challenge?.title ?? plan?.nombre ?? rutina.nombrePlan,
    subtitle: props.subtitle ?? challenge?.subtitle ?? defaultSubtitle,
    ariaLabel: props.ariaLabel ?? "Mi plan",
  };
}

export const PlanDaysDashboard = memo(function PlanDaysDashboard({
  rutina,
  days,
  eyebrow,
  title,
  subtitle,
  ariaLabel,
  sheetContainment = "fullscreen",
  getDayProgreso,
  upsertProgreso,
}: PlanDaysDashboardProps) {
  const [selectedDay, setSelectedDay] = useState<ChallengeDay | null>(null);
  const copy = resolvePlanCopy(rutina, { eyebrow, title, subtitle, ariaLabel });

  const stats = useMemo(() => {
    const completed = days.filter((day) => day.state === "completed").length;
    const unlocked = days.filter((day) => day.state !== "locked").length;
    const today = days.find((day) => day.isToday && day.state !== "locked");
    return {
      completed,
      unlocked,
      today,
      progress: Math.round((completed / Math.max(days.length, 1)) * 100),
    };
  }, [days]);

  if (days.length === 0) {
    return (
      <p className="alumnas-panel__status">
        Este plan todavía no tiene días cargados.
      </p>
    );
  }

  return (
    <section className="challenge28" aria-label={copy.ariaLabel}>
      <div className="challenge28__hero">
        <div>
          <span className="challenge28__eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div
          className="challenge28__ring"
          style={{ "--challenge-progress": `${stats.progress}%` } as CSSProperties}
          aria-label={`${stats.progress}% completo`}
        >
          <strong>{stats.progress}%</strong>
          <span>completo</span>
        </div>
      </div>

      <div className="challenge28__stats" aria-label="Estadísticas del plan">
        <article>
          <span>Días completos</span>
          <strong>{stats.completed}</strong>
        </article>
        <article>
          <span>Desbloqueados</span>
          <strong>{stats.unlocked}</strong>
        </article>
        <article>
          <span>Hoy</span>
          <strong>{stats.today?.dayNumber ?? "-"}</strong>
        </article>
      </div>

      <div className="challenge28__progress" aria-hidden="true">
        <span style={{ width: `${stats.progress}%` }} />
      </div>

      <div className="challenge28__grid">
        {days.map((day) => {
          const isLocked = day.state === "locked";
          return (
            <button
              className={`challenge28__day challenge28__day--${day.state}${
                day.isToday ? " challenge28__day--today" : ""
              }`}
              key={day.dayNumber}
              type="button"
              disabled={isLocked}
              onClick={() => setSelectedDay(day)}
              aria-label={`Día ${day.dayNumber}: ${day.title}`}
            >
              {day.thumbnail ? (
                <img src={day.thumbnail.url} alt="" loading="lazy" />
              ) : (
                <span className="challenge28__day-orb" aria-hidden="true" />
              )}
              <strong>{day.dayNumber}</strong>
              <span>{isLocked ? "Bloqueado" : day.title}</span>
            </button>
          );
        })}
      </div>

      <ChallengeDaySheet
        day={selectedDay}
        rutina={rutina}
        rutinaId={rutina.id}
        onClose={() => setSelectedDay(null)}
        containment={sheetContainment}
        getDayProgreso={getDayProgreso}
        upsertProgreso={upsertProgreso}
      />
    </section>
  );
});
