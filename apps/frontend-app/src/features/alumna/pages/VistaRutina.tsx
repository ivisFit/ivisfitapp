"use client";

import { useCallback, useMemo, useState } from "react";
import { AlumnaRutinaSkeleton } from "@/components/skeletons/AppSkeleton";
import { useAuth } from "@/context/AuthContext";
import { CoachInsightBanner } from "@/features/alumna/components/CoachInsightBanner";
import { ChallengeDaySheet } from "@/features/alumna/components/ChallengeDaySheet";
import { DayCloseUndoBar } from "@/features/alumna/components/DayCloseUndoBar";
import { PlanDaysDashboard } from "@/features/alumna/components/PlanDaysDashboard";
import { TrainingStoryPreview } from "@/features/alumna/components/TrainingStoryPreview";
import { WaitingStateActions } from "@/features/alumna/components/WaitingStateActions";
import { usePlanDayCompletions } from "@/features/alumna/hooks/usePlanDayCompletions";
import { useRutinaActiva } from "@/features/alumna/hooks/useRutinaActiva";
import {
  applyManualDayCompletions,
  getRutinaDayDateKey,
} from "@/features/alumna/lib/rutina-day-progress";
import { buildTodayCompletionInput } from "@/features/alumna/hooks/usePlanDayCompletions";
import {
  buildChallenge28Days,
  buildPlanDays,
  getFlatRoutineDays,
  getTodayDateKey,
  hasCustomPlanContent,
  resolveRutinaDay,
  type ChallengeDay,
} from "@/features/alumna/lib/rutina-day";

type RutinaView = "story" | "plan";

export function VistaRutina() {
  const [activeView, setActiveView] = useState<RutinaView>("story");
  const [catchUpDateKey, setCatchUpDateKey] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const {
    rutina,
    loading: rutinaLoading,
    error: rutinaError,
  } = useRutinaActiva(user?.id);

  const {
    completedDateKeys,
    markDayComplete,
    markDayIncomplete,
    markDaySkipped,
    isDayComplete,
    getDayProgreso,
    upsertProgreso,
    dayCloseUndo,
  } = usePlanDayCompletions(rutina?.id, rutina);

  const dayInfo = useMemo(
    () => (rutina ? resolveRutinaDay(rutina) : null),
    [rutina],
  );

  const todayDateKey = useMemo(
    () => (rutina && dayInfo ? getRutinaDayDateKey(rutina, dayInfo) : null),
    [dayInfo, rutina],
  );

  const planDays = useMemo(() => {
    if (!rutina || !dayInfo) return [];
    const flatDays = getFlatRoutineDays(rutina);
    const hasCustomPlanContentFlag = hasCustomPlanContent(rutina);

    const baseDays =
      hasCustomPlanContentFlag && flatDays.length > 0
        ? buildChallenge28Days(rutina, dayInfo, flatDays.length)
        : buildPlanDays(rutina, dayInfo);

    return applyManualDayCompletions(baseDays, completedDateKeys, getDayProgreso);
  }, [completedDateKeys, dayInfo, getDayProgreso, rutina]);

  const todayKey = getTodayDateKey();
  const pendingDay = useMemo(
    () =>
      planDays.find((day) => day.state === "missed" && day.dateKey < todayKey) ??
      null,
    [planDays, todayKey],
  );
  const catchUpDay = useMemo(
    () => planDays.find((day) => day.dateKey === catchUpDateKey) ?? null,
    [catchUpDateKey, planDays],
  );

  const finishPlanDay = useCallback(
    (day: ChallengeDay) => {
      if (!day.numeroSemana || !day.nombreDia) return;
      void markDayComplete({
        dateKey: day.dateKey,
        numeroSemana: day.numeroSemana,
        nombreDia: day.nombreDia,
        ejerciciosCompletados: day.ejercicios
          .map((ejercicio) => ejercicio.id)
          .filter(Boolean),
      });
    },
    [markDayComplete],
  );

  const finishPlanDayIncomplete = useCallback(
    (day: ChallengeDay) => {
      if (!day.numeroSemana || !day.nombreDia) return;
      void markDayIncomplete({
        dateKey: day.dateKey,
        numeroSemana: day.numeroSemana,
        nombreDia: day.nombreDia,
      });
    },
    [markDayIncomplete],
  );

  const skipPlanDay = useCallback(
    (day: ChallengeDay) => {
      if (!day.numeroSemana || !day.nombreDia) return;
      void markDaySkipped({
        dateKey: day.dateKey,
        numeroSemana: day.numeroSemana,
        nombreDia: day.nombreDia,
      });
    },
    [markDaySkipped],
  );

  const handleSkipDay = useCallback(() => {
    if (!rutina || !dayInfo) return;
    void markDaySkipped(buildTodayCompletionInput(rutina, dayInfo));
  }, [dayInfo, markDaySkipped, rutina]);

  const handleFinishIncomplete = useCallback(() => {
    if (!rutina || !dayInfo) return;
    void markDayIncomplete({
      dateKey: getRutinaDayDateKey(rutina, dayInfo),
      numeroSemana: dayInfo.numeroSemana,
      nombreDia: dayInfo.nombreDia,
    });
  }, [dayInfo, markDayIncomplete, rutina]);

  const loading = authLoading || rutinaLoading;
  const error = rutinaError;

  if (loading) {
    return (
      <>
        <CoachInsightBanner />
        <AlumnaRutinaSkeleton />
      </>
    );
  }

  return (
    <>
      <CoachInsightBanner />

      <section className="feature-card alumna-rutina alumna-rutina--experience">
        {!loading && error ? <p className="auth-error">{error}</p> : null}

        {!loading && !error && (!rutina || !dayInfo) ? (
          <div className="waiting-state">
            <p className="waiting-state__title">
              Tu coach está preparando tu rutina
            </p>
            <p className="waiting-state__text">
              En cuanto te asignen el plan, va a aparecer acá con videos y
              seguimiento día a día.
            </p>
            <WaitingStateActions
              nombre={user?.name}
              whatsappTema="consulto por mi rutina"
            />
          </div>
        ) : null}

        {!loading && !error && rutina && dayInfo ? (
          <div className="alumna-rutina__experience">
            <div className="alumna-rutina__tabs" role="tablist" aria-label="Tu rutina">
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "story"}
                className={activeView === "story" ? "is-active" : ""}
                onClick={() => setActiveView("story")}
              >
                Hoy
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "plan"}
                className={activeView === "plan" ? "is-active" : ""}
                onClick={() => setActiveView("plan")}
              >
                Mi plan
              </button>
            </div>

            {activeView === "story" && todayDateKey ? (
              <>
                {pendingDay ? (
                  <div className="rutina-catchup" role="status">
                    <p>
                      Te quedó <strong>{pendingDay.title}</strong> sin hacer.
                      Hacerlo ahora no reemplaza el entrenamiento de hoy: hoy
                      sigue en esta pantalla.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCatchUpDateKey(pendingDay.dateKey)}
                    >
                      Hacer ese día
                    </button>
                  </div>
                ) : null}
                <TrainingStoryPreview
                  rutina={rutina}
                  dayInfo={dayInfo}
                  dayDateKey={todayDateKey}
                  isDayCompleted={isDayComplete(
                    todayDateKey,
                    dayInfo.numeroSemana,
                    dayInfo.nombreDia,
                  )}
                  getDayProgreso={getDayProgreso}
                  upsertProgreso={upsertProgreso}
                  onFinishDay={() =>
                    void markDayComplete(buildTodayCompletionInput(rutina, dayInfo))
                  }
                  onFinishIncomplete={handleFinishIncomplete}
                  onSkipDay={handleSkipDay}
                />
              </>
            ) : null}

            {activeView === "plan" ? (
              <PlanDaysDashboard
                rutina={rutina}
                days={planDays}
                getDayProgreso={getDayProgreso}
                upsertProgreso={upsertProgreso}
                onFinishDay={finishPlanDay}
                onFinishIncomplete={finishPlanDayIncomplete}
                onSkipDay={skipPlanDay}
              />
            ) : null}

            {activeView === "story" && catchUpDay ? (
              <ChallengeDaySheet
                day={catchUpDay}
                rutina={rutina}
                rutinaId={rutina.id}
                onClose={() => setCatchUpDateKey(null)}
                getDayProgreso={getDayProgreso}
                upsertProgreso={upsertProgreso}
                onFinishDay={finishPlanDay}
                onFinishIncomplete={finishPlanDayIncomplete}
                onSkipDay={skipPlanDay}
              />
            ) : null}

          </div>
        ) : null}
      </section>
      {dayCloseUndo ? (
        <DayCloseUndoBar
          message={dayCloseUndo.message}
          busy={dayCloseUndo.busy}
          error={dayCloseUndo.error}
          onUndo={() => void dayCloseUndo.restore()}
        />
      ) : null}
    </>
  );
}
