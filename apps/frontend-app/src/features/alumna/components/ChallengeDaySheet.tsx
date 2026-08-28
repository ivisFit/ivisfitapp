"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExerciseWeightLog } from "@/features/alumna/components/ExerciseWeightLog";
import {
  useHistoricoPesos,
  useLogsPesos,
} from "@/features/alumna/hooks/useLogsPesos";
import { useRutinaProgreso } from "@/features/alumna/hooks/useRutinaProgreso";
import type {
  RutinaProgresoRecord,
  UpsertRutinaProgresoPayload,
} from "@/features/alumna/types/rutina-progreso";
import { useSaveLogPeso } from "@/features/alumna/hooks/useSaveLogPeso";
import { VideoPlayIcon } from "@/components/icons/exercise-action-icons";
import { DayIntroMedia } from "@/features/alumna/components/DayIntroMedia";
import type { ChallengeDay, DayStoryStep } from "@/features/alumna/lib/rutina-day";
import type { RutinaDetail, RutinaEjercicio } from "@/features/alumna/types/rutina";
import {
  buildDayStorySequence,
  formatDescanso,
  getYoutubeEmbedUrl,
  resolveDayInfoForPlanDayNumber,
} from "@/features/alumna/lib/rutina-day";

export type SheetContainment = "viewport" | "fullscreen";

function sheetStoryLabel(kind: DayStoryStep["kind"]): string {
  switch (kind) {
    case "weekIntro":
      return "Presentación de la semana";
    case "dayIntro":
      return "Presentación del día";
    case "dayOutro":
      return "Cierre del día";
    case "weekOutro":
      return "Cierre de la semana";
    default:
      return "Video";
  }
}

type ChallengeDaySheetProps = {
  day: ChallengeDay | null;
  rutinaId: string;
  rutina?: RutinaDetail;
  onClose: () => void;
  containment?: SheetContainment;
  getDayProgreso?: (
    dateKey: string,
    numeroSemana?: number,
    nombreDia?: string,
  ) => RutinaProgresoRecord | undefined;
  upsertProgreso?: (
    payload: UpsertRutinaProgresoPayload,
  ) => Promise<RutinaProgresoRecord>;
};

export function ChallengeDaySheet({
  day,
  rutinaId,
  rutina,
  onClose,
  containment = "fullscreen",
  getDayProgreso: getDayProgresoProp,
  upsertProgreso: upsertProgresoProp,
}: ChallengeDaySheetProps) {
  const isContained = containment === "viewport";
  const [selectedExercise, setSelectedExercise] = useState<RutinaEjercicio | null>(
    null,
  );
  const selectedExerciseRef = useRef(selectedExercise);
  selectedExerciseRef.current = selectedExercise;
  const progressFromHook = useRutinaProgreso(
    rutinaId,
    rutina ?? null,
    day !== null && (!getDayProgresoProp || !upsertProgresoProp),
  );
  const getDayProgreso = getDayProgresoProp ?? progressFromHook.getDayProgreso;
  const upsertProgreso = upsertProgresoProp ?? progressFromHook.upsertProgreso;
  const canLogWeights = Boolean(
    day &&
      day.state !== "locked" &&
      day.numeroSemana &&
      day.nombreDia?.trim(),
  );
  const { logsByEjercicioId } = useLogsPesos({
    rutinaId,
    semana: day?.numeroSemana,
    dia: day?.nombreDia,
    enabled: canLogWeights,
  });
  const { logsByEjercicioId: historicoByEjercicioId } = useHistoricoPesos({
    rutinaId,
    semana: day?.numeroSemana,
    dia: day?.nombreDia,
    enabled: canLogWeights,
  });
  const { scheduleSave, getStatus } = useSaveLogPeso();

  const dayProgreso = day
    ? getDayProgreso(day.dateKey, day.numeroSemana, day.nombreDia)
    : undefined;
  const completedIds = useMemo(
    () => new Set(dayProgreso?.ejerciciosCompletados ?? []),
    [dayProgreso],
  );
  const storySequence = useMemo(() => {
    if (!rutina || !day) return [];
    const dayInfo = resolveDayInfoForPlanDayNumber(rutina, day.dayNumber);
    if (!dayInfo) return [];
    return buildDayStorySequence(rutina, dayInfo);
  }, [day, rutina]);
  const introSteps = storySequence.filter(
    (step): step is Extract<DayStoryStep, { kind: "weekIntro" | "dayIntro" }> =>
      step.kind === "weekIntro" || step.kind === "dayIntro",
  );
  const outroSteps = storySequence.filter(
    (step): step is Extract<DayStoryStep, { kind: "dayOutro" | "weekOutro" }> =>
      step.kind === "dayOutro" || step.kind === "weekOutro",
  );

  useEffect(() => {
    if (!day) {
      setSelectedExercise(null);
    }
  }, [day]);

  useEffect(() => {
    if (!day || isContained) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [day, isContained]);

  useEffect(() => {
    if (!day || isContained) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (selectedExerciseRef.current) {
        setSelectedExercise(null);
        return;
      }
      onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [day, isContained, onClose]);

  if (!day) return null;

  const selectedExerciseEmbedUrl = selectedExercise?.videoUrl
    ? getYoutubeEmbedUrl(selectedExercise.videoUrl)
    : null;

  async function toggleCompleted(ejercicioId: string) {
    if (!day?.numeroSemana || !day.nombreDia) return;

    const current = [
      ...(getDayProgreso(day.dateKey, day.numeroSemana, day.nombreDia)
        ?.ejerciciosCompletados ?? []),
    ];
    const next = current.includes(ejercicioId)
      ? current.filter((id) => id !== ejercicioId)
      : [...current, ejercicioId];

    await upsertProgreso({
      rutinaId,
      dateKey: day.dateKey,
      numeroSemana: day.numeroSemana,
      nombreDia: day.nombreDia,
      ejerciciosCompletados: next,
      diaCompletado:
        getDayProgreso(day.dateKey, day.numeroSemana, day.nombreDia)?.diaCompletado ??
        false,
    });
  }

  const content = (
    <div
      className={`challenge-sheet${isContained ? " challenge-sheet--contained" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="challenge-sheet__backdrop"
        type="button"
        aria-label="Cerrar detalle del día"
        onClick={onClose}
      />
      <article className="challenge-sheet__panel">
        <div className="challenge-sheet__handle" aria-hidden="true" />
        <div className="challenge-sheet__header">
          <div>
            <span>Día {day.dayNumber}</span>
            <h3>{day.title}</h3>
          </div>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="challenge-sheet__scroll">
          {introSteps.map((step) => (
            <section key={step.kind} className="challenge-sheet__story-block">
              <p className="challenge-sheet__story-label">
                {sheetStoryLabel(step.kind)}
              </p>
              <DayIntroMedia
                media={step.media}
                variant="sheet"
                title={sheetStoryLabel(step.kind)}
              />
            </section>
          ))}
          {introSteps.length === 0 && (day.media || day.thumbnail) ? (
            <section className="challenge-sheet__story-block">
              <p className="challenge-sheet__story-label">Presentación del día</p>
              <DayIntroMedia
                media={day.media ?? day.thumbnail}
                variant="sheet"
                title="Presentación del día"
              />
            </section>
          ) : null}
          <div className="challenge-sheet__body">
            <div className="challenge-sheet__tags">
              {(day.tags ?? []).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            {day.ejercicios.length > 0 ? (
              <ul className="challenge-sheet__exercises">
                {day.ejercicios.map((ejercicio, index) => {
                  const isCompleted = completedIds.has(ejercicio.id);
                  const embedUrl = getYoutubeEmbedUrl(ejercicio.videoUrl);
                  const exerciseKey = `${ejercicio.id}-${index}`;

                  return (
                    <li
                      className={isCompleted ? "is-completed" : ""}
                      key={exerciseKey}
                    >
                      <div className="challenge-sheet__exercise-row">
                        <button
                          className="challenge-sheet__check"
                          type="button"
                          aria-pressed={isCompleted}
                          aria-label={
                            isCompleted
                              ? `Marcar ${ejercicio.nombre} como pendiente`
                              : `Marcar ${ejercicio.nombre} como cumplido`
                          }
                          onClick={() => void toggleCompleted(ejercicio.id)}
                        >
                          {isCompleted ? "✓" : ""}
                        </button>
                        <div className="challenge-sheet__exercise-copy">
                          <strong>{ejercicio.nombre}</strong>
                          <span>
                            Descanso {formatDescanso(ejercicio.descansoSegundos)} ·{" "}
                            {ejercicio.series} x {ejercicio.repeticiones}
                          </span>
                        </div>
                        <div className="challenge-sheet__exercise-actions">
                          {embedUrl ? (
                            <button
                              className="challenge-sheet__video-button alumna-action-btn"
                              type="button"
                              aria-label={`Ver video de ${ejercicio.nombre}`}
                              onClick={() => setSelectedExercise(ejercicio)}
                            >
                              <span className="alumna-action-btn__icon" aria-hidden>
                                <VideoPlayIcon size={18} />
                              </span>
                              <span className="alumna-action-btn__label">Ver video</span>
                            </button>
                          ) : ejercicio.videoUrl ? (
                            <a
                              className="challenge-sheet__video-link"
                              href={ejercicio.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Abrir video
                            </a>
                          ) : null}
                        </div>
                      </div>

                      {canLogWeights && day.numeroSemana && day.nombreDia ? (
                        <ExerciseWeightLog
                          ejercicio={ejercicio}
                          rutinaId={rutinaId}
                          semana={day.numeroSemana}
                          dia={day.nombreDia}
                          initialPesos={logsByEjercicioId[ejercicio.id]}
                          historicoPesos={historicoByEjercicioId[ejercicio.id]}
                          saveStatus={getStatus(ejercicio.id)}
                          variant="sheet"
                          onPesosChange={scheduleSave}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="challenge-sheet__empty">
                Este día queda reservado para sumar contenido.
              </p>
            )}

            {outroSteps.length > 0
              ? outroSteps.map((step) => (
                  <section key={step.kind} className="challenge-sheet__story-block">
                    <p className="challenge-sheet__story-label">
                      {sheetStoryLabel(step.kind)}
                    </p>
                    <DayIntroMedia
                      media={step.media}
                      variant="sheet"
                      title={sheetStoryLabel(step.kind)}
                    />
                  </section>
                ))
              : (
                <>
                  {day.farewellMedia ? (
                    <section className="challenge-sheet__story-block">
                      <p className="challenge-sheet__story-label">Cierre del día</p>
                      <DayIntroMedia
                        media={day.farewellMedia}
                        variant="sheet"
                        title="Cierre del día"
                      />
                    </section>
                  ) : null}
                  {day.weekFarewellMedia ? (
                    <section className="challenge-sheet__story-block">
                      <p className="challenge-sheet__story-label">
                        Cierre de la semana
                      </p>
                      <DayIntroMedia
                        media={day.weekFarewellMedia}
                        variant="sheet"
                        title="Cierre de la semana"
                      />
                    </section>
                  ) : null}
                </>
              )}
          </div>
        </div>
      </article>

      {selectedExercise && selectedExerciseEmbedUrl ? (
        <div
          className={`challenge-exercise-video${
            isContained ? " challenge-exercise-video--contained" : ""
          }`}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="challenge-exercise-video__backdrop"
            type="button"
            aria-label="Cerrar video"
            onClick={() => setSelectedExercise(null)}
          />
          <article className="challenge-exercise-video__panel">
            <div className="challenge-exercise-video__header">
              <div>
                <span>Video del ejercicio</span>
                <h3>{selectedExercise.nombre}</h3>
              </div>
              <button type="button" onClick={() => setSelectedExercise(null)}>
                Cerrar
              </button>
            </div>
            <div className="challenge-exercise-video__frame">
              <iframe
                title={`Video de ${selectedExercise.nombre}`}
                src={selectedExerciseEmbedUrl}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );

  if (isContained) {
    return content;
  }

  return createPortal(content, document.body);
}
