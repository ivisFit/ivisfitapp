"use client";

import { useMemo, useState } from "react";
import { AlumnaRutinaSkeleton } from "@/components/skeletons/AppSkeleton";
import { useAuth } from "@/context/AuthContext";
import { CoachInsightBanner } from "@/features/alumna/components/CoachInsightBanner";
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
  hasCustomPlanContent,
  resolveRutinaDay,
} from "@/features/alumna/lib/rutina-day";

type RutinaView = "story" | "plan";

export function VistaRutina() {
  const [activeView, setActiveView] = useState<RutinaView>("story");
  const { user, loading: authLoading } = useAuth();
  const {
    rutina,
    loading: rutinaLoading,
    error: rutinaError,
  } = useRutinaActiva(user?.id);

  const dayInfo = useMemo(
    () => (rutina ? resolveRutinaDay(rutina) : null),
    [rutina],
  );
  const { completedDateKeys, markDayComplete, isDayComplete, getDayProgreso, upsertProgreso } =
    usePlanDayCompletions(rutina?.id, rutina);

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
            <div className="alumna-rutina__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeView === "story"}
                className={activeView === "story" ? "is-active" : ""}
                onClick={() => setActiveView("story")}
              >
                Historia
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
              />
            ) : null}

            {activeView === "plan" ? (
              <PlanDaysDashboard
                rutina={rutina}
                days={planDays}
                getDayProgreso={getDayProgreso}
                upsertProgreso={upsertProgreso}
              />
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
