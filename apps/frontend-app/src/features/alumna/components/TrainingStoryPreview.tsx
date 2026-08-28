"use client";

import { useEffect, useMemo, useState } from "react";
import { VideoPlayIcon, RestTimerIcon } from "@/components/icons/exercise-action-icons";
import { DayIntroMedia } from "@/features/alumna/components/DayIntroMedia";
import { ExerciseWeightLog } from "@/features/alumna/components/ExerciseWeightLog";
import { RestTimerModal } from "@/features/alumna/components/RestTimerModal";
import {
  useHistoricoPesos,
  useLogsPesos,
} from "@/features/alumna/hooks/useLogsPesos";
import { useSaveLogPeso } from "@/features/alumna/hooks/useSaveLogPeso";
import { useRutinaProgreso } from "@/features/alumna/hooks/useRutinaProgreso";
import type { UpsertRutinaProgresoPayload } from "@/features/alumna/types/rutina-progreso";
import {
  buildDayStorySequence,
  formatDescanso,
  getYoutubeEmbedUrl,
  type DayStoryStep,
} from "@/features/alumna/lib/rutina-day";
import type { RutinaDay } from "@/features/alumna/lib/rutina-day";
import type { RutinaDetail, RutinaMediaAsset } from "@/features/alumna/types/rutina";

import type { RutinaProgresoRecord } from "@/features/alumna/types/rutina-progreso";

type TrainingStoryPreviewProps = {
  rutina: RutinaDetail;
  dayInfo: RutinaDay;
  dayDateKey: string;
  isDayCompleted: boolean;
  onFinishDay: () => void;
  getDayProgreso?: (
    dateKey: string,
    numeroSemana?: number,
    nombreDia?: string,
  ) => RutinaProgresoRecord | undefined;
  upsertProgreso?: (
    payload: UpsertRutinaProgresoPayload,
  ) => Promise<RutinaProgresoRecord>;
};

function StoryBackground({ media }: { media?: RutinaMediaAsset }) {
  if (!media) {
    return (
      <div className="training-story__placeholder" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <video
        className="training-story__media"
        src={media.url}
        poster={media.posterUrl}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return (
    <img
      className="training-story__media"
      src={media.url}
      alt={media.alt ?? ""}
      loading="lazy"
    />
  );
}

function getExerciseKey(ejercicioId: string): string {
  return ejercicioId || "ejercicio";
}

function isIntroStep(step: DayStoryStep | undefined): boolean {
  return step?.kind === "weekIntro" || step?.kind === "dayIntro";
}

function isOutroStep(step: DayStoryStep | undefined): boolean {
  return step?.kind === "dayOutro" || step?.kind === "weekOutro";
}

function storyStepLabel(step: DayStoryStep): string {
  switch (step.kind) {
    case "weekIntro":
      return "Introducción de la semana";
    case "dayIntro":
      return "Introducción del día";
    case "exercise":
      return `Ejercicio ${step.index + 1}`;
    case "dayOutro":
      return "Despedida del día";
    case "weekOutro":
      return "Despedida de la semana";
  }
}

function storyStepCopy(
  step: DayStoryStep,
  completedCount: number,
  totalExercises: number,
): string {
  switch (step.kind) {
    case "weekIntro":
      return "Mirá el mensaje de la semana antes de empezar.";
    case "dayIntro":
      return "Mirá el mensaje del día antes de empezar.";
    case "dayOutro":
      return `Completaste ${completedCount} de ${totalExercises} ejercicios. Cerrá el día con este mensaje.`;
    case "weekOutro":
      return "Cerrá la semana con este mensaje.";
    default:
      return "";
  }
}

export function TrainingStoryPreview({
  rutina,
  dayInfo,
  dayDateKey,
  isDayCompleted,
  onFinishDay,
  getDayProgreso: getDayProgresoProp,
  upsertProgreso: upsertProgresoProp,
}: TrainingStoryPreviewProps) {
  const sequence = useMemo(
    () => buildDayStorySequence(rutina, dayInfo),
    [dayInfo, rutina],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedVideoKey, setSelectedVideoKey] = useState<string | null>(null);
  const [restTimerExerciseKey, setRestTimerExerciseKey] = useState<string | null>(
    null,
  );
  const progressFromHook = useRutinaProgreso(
    rutina.id,
    rutina,
    !getDayProgresoProp || !upsertProgresoProp,
  );
  const getDayProgreso = getDayProgresoProp ?? progressFromHook.getDayProgreso;
  const upsertProgreso = upsertProgresoProp ?? progressFromHook.upsertProgreso;
  const dayProgreso = getDayProgreso(
    dayDateKey,
    dayInfo.numeroSemana,
    dayInfo.nombreDia,
  );
  const completedIds = dayProgreso?.ejerciciosCompletados ?? [];
  const { logsByEjercicioId } = useLogsPesos({
    rutinaId: rutina.id,
    semana: dayInfo.numeroSemana,
    dia: dayInfo.nombreDia,
  });
  const { logsByEjercicioId: historicoByEjercicioId } = useHistoricoPesos({
    rutinaId: rutina.id,
    semana: dayInfo.numeroSemana,
    dia: dayInfo.nombreDia,
  });
  const { scheduleSave, getStatus } = useSaveLogPeso();
  const story = rutina.storyPreview;
  const title = story?.title ?? rutina.nombrePlan;
  const subtitle =
    story?.subtitle ?? `${dayInfo.nombreDia} · Semana ${dayInfo.numeroSemana}`;
  const totalExercises = dayInfo.ejercicios.length;
  const completedCount = completedIds.length;
  const allExerciseIds = dayInfo.ejercicios.map((ejercicio) =>
    getExerciseKey(ejercicio.id),
  );
  const allExercisesCompleted =
    totalExercises === 0 ||
    allExerciseIds.every((ejercicioId) => completedIds.includes(ejercicioId));
  const safeStepIndex =
    sequence.length === 0 ? 0 : Math.min(stepIndex, sequence.length - 1);
  const currentStep = sequence[safeStepIndex];
  const nextStep = sequence[safeStepIndex + 1];
  const isLastStep = sequence.length > 0 && safeStepIndex === sequence.length - 1;
  const isIntroView = isIntroStep(currentStep);
  const isOutroView = isOutroStep(currentStep);
  const isExerciseView = currentStep?.kind === "exercise";
  const activeIndex = currentStep?.kind === "exercise" ? currentStep.index : 0;
  const isLastExercise =
    currentStep?.kind === "exercise" && currentStep.index === totalExercises - 1;
  const activeEjercicio =
    currentStep?.kind === "exercise"
      ? currentStep.ejercicio
      : dayInfo.ejercicios[activeIndex];
  const activeExerciseId = activeEjercicio
    ? getExerciseKey(activeEjercicio.id)
    : null;
  const isActiveCompleted = activeExerciseId
    ? completedIds.includes(activeExerciseId)
    : false;
  const activeEmbedUrl = activeEjercicio?.videoUrl
    ? getYoutubeEmbedUrl(activeEjercicio.videoUrl)
    : null;
  const selectedVideoExercise = dayInfo.ejercicios.find(
    (ejercicio) => getExerciseKey(ejercicio.id) === selectedVideoKey,
  );
  const selectedVideoEmbedUrl = selectedVideoExercise?.videoUrl
    ? getYoutubeEmbedUrl(selectedVideoExercise.videoUrl)
    : null;

  useEffect(() => {
    setStepIndex(0);
    setSelectedVideoKey(null);
    setRestTimerExerciseKey(null);
  }, [dayDateKey]);

  async function toggleCompleted(ejercicioId: string) {
    const current = [
      ...(getDayProgreso(dayDateKey, dayInfo.numeroSemana, dayInfo.nombreDia)
        ?.ejerciciosCompletados ?? []),
    ];
    const next = current.includes(ejercicioId)
      ? current.filter((id) => id !== ejercicioId)
      : [...current, ejercicioId];

    await upsertProgreso({
      rutinaId: rutina.id,
      dateKey: dayDateKey,
      numeroSemana: dayInfo.numeroSemana,
      nombreDia: dayInfo.nombreDia,
      ejerciciosCompletados: next,
      diaCompletado:
        getDayProgreso(dayDateKey, dayInfo.numeroSemana, dayInfo.nombreDia)
          ?.diaCompletado ?? false,
    });
  }

  function goToExercise(index: number) {
    const nextIndex = sequence.findIndex(
      (step) => step.kind === "exercise" && step.index === index,
    );
    if (nextIndex < 0) return;
    setStepIndex(nextIndex);
    setRestTimerExerciseKey(null);
  }

  function goNext() {
    if (isLastStep) return;
    if (isOutroStep(nextStep) && !allExercisesCompleted) return;
    setRestTimerExerciseKey(null);
    setStepIndex((current) => Math.min(current + 1, sequence.length - 1));
  }

  function goPrev() {
    setRestTimerExerciseKey(null);
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  const steps = sequence.map((step, index) => {
    const completed =
      step.kind === "exercise"
        ? completedIds.includes(getExerciseKey(step.ejercicio.id))
        : isOutroStep(step)
          ? isDayCompleted || index < safeStepIndex
          : index < safeStepIndex;

    return {
      id: `${step.kind}-${index}`,
      label: storyStepLabel(step),
      completed,
    };
  });

  const canAdvanceToOutro = allExercisesCompleted;
  const showFinishHint =
    isLastExercise &&
    !isDayCompleted &&
    !allExercisesCompleted &&
    (isOutroStep(nextStep) || isLastStep);

  return (
    <section className="training-story" aria-label="Preview de rutina">
      <StoryBackground media={story?.background} />
      <div className="training-story__scrim" />

      <div className="training-story__content">
        {steps.length > 1 ? (
          <div
            className="training-story__segments"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={safeStepIndex + 1}
            aria-label={currentStep ? storyStepLabel(currentStep) : "Rutina del día"}
          >
            {steps.map((step, index) => {
              const stateClass = step.completed
                ? " is-completed"
                : index === safeStepIndex
                  ? " is-active"
                  : "";
              return (
                <span
                  key={step.id}
                  className={`training-story__segment${stateClass}`}
                  title={step.label}
                />
              );
            })}
          </div>
        ) : null}

        <div className="training-story__header">
          <span className="training-story__eyebrow">Tu entrenamiento de hoy</span>
          <div className="training-story__headline">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

        {isIntroView && currentStep && "media" in currentStep ? (
          <div className="training-story__step training-story__step--intro">
            <DayIntroMedia
              media={currentStep.media}
              variant="story"
              title={storyStepLabel(currentStep)}
            />
            <p className="training-story__intro-copy">
              {storyStepCopy(currentStep, completedCount, totalExercises)}
            </p>
            <nav className="training-story__nav" aria-label="Navegación de introducción">
              {safeStepIndex > 0 ? (
                <button
                  type="button"
                  className="training-story__nav-btn training-story__nav-btn--ghost"
                  onClick={goPrev}
                >
                  Anterior
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="training-story__nav-btn training-story__nav-btn--primary"
                onClick={goNext}
              >
                Siguiente
              </button>
            </nav>
          </div>
        ) : null}

        {isOutroView && currentStep && "media" in currentStep ? (
          <div className="training-story__step training-story__step--outro">
            <DayIntroMedia
              media={currentStep.media}
              variant="story"
              title={storyStepLabel(currentStep)}
            />
            <p className="training-story__outro-copy">
              {storyStepCopy(currentStep, completedCount, totalExercises)}
            </p>
            <nav className="training-story__nav" aria-label="Navegación de despedida">
              <button
                type="button"
                className="training-story__nav-btn training-story__nav-btn--ghost"
                onClick={goPrev}
              >
                Anterior
              </button>
              {isLastStep ? (
                <button
                  type="button"
                  className={`training-story__nav-btn training-story__nav-btn--primary${
                    isDayCompleted ? " is-completed" : ""
                  }`}
                  disabled={isDayCompleted || !allExercisesCompleted}
                  onClick={onFinishDay}
                >
                  {isDayCompleted ? "Día completado ✓" : "Finalizar día"}
                </button>
              ) : (
                <button
                  type="button"
                  className="training-story__nav-btn training-story__nav-btn--primary"
                  onClick={goNext}
                >
                  Siguiente
                </button>
              )}
            </nav>
          </div>
        ) : null}

        {isExerciseView && totalExercises > 0 && activeEjercicio && activeExerciseId ? (
          <div className="training-story__step training-story__step--exercise">
            <p className="training-story__counter">
              Ejercicio {activeIndex + 1} de {totalExercises}
            </p>

            {totalExercises > 1 ? (
              <div className="training-story__exercise-switcher" role="list">
                {dayInfo.ejercicios.map((ejercicio, index) => (
                  <button
                    key={`${ejercicio.id}-${index}`}
                    type="button"
                    role="listitem"
                    className={
                      index === activeIndex
                        ? "training-story__exercise-chip is-active"
                        : "training-story__exercise-chip"
                    }
                    onClick={() => goToExercise(index)}
                  >
                    {index + 1}. {ejercicio.nombre}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="training-story__exercise-header">
              <h3 className="training-story__exercise-name">
                {activeEjercicio.nombre}
              </h3>
              <span className="training-story__exercise-scheme">
                {activeEjercicio.series} × {activeEjercicio.repeticiones}
              </span>
            </div>

            <div className="training-story__exercise-actions">
              {activeEmbedUrl ? (
                <button
                  className="training-story__action-btn"
                  type="button"
                  aria-label={`Ver video de ${activeEjercicio.nombre}`}
                  onClick={() => setSelectedVideoKey(activeExerciseId)}
                >
                  <VideoPlayIcon size={18} />
                  <span className="training-story__action-label">Video</span>
                </button>
              ) : null}
              <button
                className="training-story__action-btn"
                type="button"
                aria-label={`Descanso ${formatDescanso(activeEjercicio.descansoSegundos)}`}
                onClick={() => setRestTimerExerciseKey(activeExerciseId)}
              >
                <RestTimerIcon size={18} />
                <span className="training-story__action-label">
                  Descanso · {formatDescanso(activeEjercicio.descansoSegundos)}
                </span>
              </button>
            </div>

            <section className="training-story__weight-log">
              <h4>Registrá tus pesos</h4>
              <ExerciseWeightLog
                ejercicio={activeEjercicio}
                rutinaId={rutina.id}
                semana={dayInfo.numeroSemana}
                dia={dayInfo.nombreDia}
                initialPesos={logsByEjercicioId[activeEjercicio.id]}
                historicoPesos={historicoByEjercicioId[activeEjercicio.id]}
                saveStatus={getStatus(activeEjercicio.id)}
                variant="story"
                onPesosChange={scheduleSave}
              />
            </section>

            <button
              type="button"
              className={`training-story__complete-btn${
                isActiveCompleted ? " is-completed" : ""
              }`}
              aria-pressed={isActiveCompleted}
              onClick={() => void toggleCompleted(activeExerciseId)}
            >
              <span className="training-story__complete-icon" aria-hidden>
                {isActiveCompleted ? "✓" : ""}
              </span>
              {isActiveCompleted ? "Completado" : "Marcar como completado"}
            </button>

            <nav
              className="training-story__nav"
              aria-label="Navegación entre ejercicios"
            >
              <button
                type="button"
                className="training-story__nav-btn training-story__nav-btn--ghost"
                disabled={safeStepIndex === 0}
                onClick={goPrev}
              >
                Anterior
              </button>
              {isLastStep ? (
                <button
                  type="button"
                  className={`training-story__nav-btn training-story__nav-btn--primary${
                    isDayCompleted ? " is-completed" : ""
                  }`}
                  disabled={isDayCompleted || !allExercisesCompleted}
                  onClick={onFinishDay}
                >
                  {isDayCompleted ? "Día completado ✓" : "Finalizar día"}
                </button>
              ) : isOutroStep(nextStep) ? (
                <button
                  type="button"
                  className="training-story__nav-btn training-story__nav-btn--primary"
                  disabled={!canAdvanceToOutro}
                  onClick={goNext}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  className="training-story__nav-btn training-story__nav-btn--primary"
                  onClick={goNext}
                >
                  Siguiente
                </button>
              )}
            </nav>
            {showFinishHint ? (
              <p className="training-story__finish-hint">
                {isOutroStep(nextStep)
                  ? "Marcá todos los ejercicios para ver la despedida."
                  : "Marcá todos los ejercicios para finalizar el día."}
              </p>
            ) : null}
          </div>
        ) : null}

        {isExerciseView && totalExercises === 0 ? (
          <p className="training-story__empty">
            Este día no tiene ejercicios cargados.
          </p>
        ) : null}

        {sequence.length === 0 ? (
          <p className="training-story__empty">
            Este día no tiene ejercicios cargados.
          </p>
        ) : null}
      </div>

      {selectedVideoExercise && selectedVideoEmbedUrl ? (
        <div className="routine-video" role="dialog" aria-modal="true">
          <button
            className="routine-video__backdrop"
            type="button"
            aria-label="Cerrar video"
            onClick={() => setSelectedVideoKey(null)}
          />
          <article className="routine-video__panel">
            <div className="routine-video__header">
              <div>
                <span>Video del ejercicio</span>
                <h3>{selectedVideoExercise.nombre}</h3>
              </div>
              <button type="button" onClick={() => setSelectedVideoKey(null)}>
                Cerrar
              </button>
            </div>
            <div className="routine-video__frame">
              <iframe
                title={`Video de ${selectedVideoExercise.nombre}`}
                src={selectedVideoEmbedUrl}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </article>
        </div>
      ) : null}

      {restTimerExerciseKey === activeExerciseId && activeEjercicio ? (
        <RestTimerModal
          ejercicioNombre={activeEjercicio.nombre}
          descansoSegundos={activeEjercicio.descansoSegundos}
          onClose={() => setRestTimerExerciseKey(null)}
        />
      ) : null}
    </section>
  );
}
