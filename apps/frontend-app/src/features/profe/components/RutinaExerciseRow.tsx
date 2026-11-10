"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Button } from "@/components";
import { EjercicioAutocomplete } from "@/features/profe/components/EjercicioAutocomplete";
import type { BancoEjercicio } from "@/features/profe/hooks/useBancoEjercicios";
import type { EjercicioRutinaDraft } from "@/features/profe/lib/rutina-draft";
import {
  clampPrescription,
  isRepeticionesPorSerieActive,
  prescriptionMax,
  REPS_MIN,
  resizeRepeticionesPorSerie,
  SERIES_MAX,
  SERIES_MIN,
  type RegistroEjercicio,
  type UnidadEjercicio,
} from "@/lib/rutina-reps";

const DESCANSO_OPTIONS = [30, 45, 60, 90, 120, 180];

const PRESETS = [
  { label: "3×12", series: 3, repeticiones: 12 },
  { label: "4×10", series: 4, repeticiones: 10 },
  { label: "4×15", series: 4, repeticiones: 15 },
] as const;

type RutinaExerciseRowProps = {
  draft: EjercicioRutinaDraft;
  index: number;
  ejercicios: BancoEjercicio[];
  canRemove: boolean;
  canDrag: boolean;
  disabled?: boolean;
  onUpdate: (patch: Partial<Omit<EjercicioRutinaDraft, "localId">>) => void;
  onRemove: () => void;
};

function formatDescanso(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60} min`;
}

export function RutinaExerciseRow({
  draft,
  index,
  ejercicios,
  canRemove,
  canDrag,
  disabled,
  onUpdate,
  onRemove,
}: RutinaExerciseRowProps) {
  const [editingExercise, setEditingExercise] = useState(!draft.ejercicioId);
  const selected = ejercicios.find((ejercicio) => ejercicio.id === draft.ejercicioId);
  const perSetMode = isRepeticionesPorSerieActive(
    draft.series,
    draft.repeticionesPorSerie,
  );
  const unidad = draft.unidad ?? "repeticiones";
  const registro = draft.registro ?? "peso";
  const maxPrescription = prescriptionMax(unidad);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: draft.localId,
    disabled: disabled || !canDrag,
  });

  function updateSeries(nextSeries: number) {
    const series = clampPrescription(nextSeries, "repeticiones");
    const boundedSeries = Math.min(SERIES_MAX, Math.max(SERIES_MIN, series));
    if (!perSetMode) {
      onUpdate({ series: boundedSeries });
      return;
    }
    onUpdate({
      series: boundedSeries,
      repeticionesPorSerie: resizeRepeticionesPorSerie(
        boundedSeries,
        draft.repeticiones,
        draft.repeticionesPorSerie,
      ).map((value) => clampPrescription(value, unidad)),
    });
  }

  function updateRepeticiones(nextRepeticiones: number) {
    onUpdate({
      repeticiones: clampPrescription(nextRepeticiones, unidad),
      repeticionesPorSerie: undefined,
    });
  }

  function updateRepeticionPorSerie(serieIndex: number, nextValue: number) {
    const next = resizeRepeticionesPorSerie(
      draft.series,
      draft.repeticiones,
      draft.repeticionesPorSerie,
    ).map((value) => clampPrescription(value, unidad));
    next[serieIndex] = clampPrescription(nextValue, unidad);
    onUpdate({
      repeticiones: next[0] ?? draft.repeticiones,
      repeticionesPorSerie: next,
    });
  }

  function updateUnidad(nextUnidad: UnidadEjercicio) {
    onUpdate({
      unidad: nextUnidad,
      repeticiones: clampPrescription(draft.repeticiones, nextUnidad),
      repeticionesPorSerie: draft.repeticionesPorSerie?.map((value) =>
        clampPrescription(value, nextUnidad),
      ),
    });
  }

  function updateRegistro(nextRegistro: RegistroEjercicio) {
    onUpdate({ registro: nextRegistro });
  }

  function enablePerSetMode() {
    onUpdate({
      repeticionesPorSerie: resizeRepeticionesPorSerie(
        draft.series,
        draft.repeticiones,
        draft.repeticionesPorSerie,
      ).map((value) => clampPrescription(value, unidad)),
    });
  }

  function disablePerSetMode() {
    onUpdate({
      repeticiones: draft.repeticionesPorSerie?.[0] ?? draft.repeticiones,
      repeticionesPorSerie: undefined,
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={
        [
          "rutina-builder__exercise-row",
          perSetMode ? "is-reps-por-serie" : "",
          isDragging ? "is-dragging" : "",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="rutina-builder__exercise-index rutina-builder__exercise-drag"
        disabled={disabled || !canDrag}
        aria-label={`Arrastrar para reordenar el ejercicio ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        {index + 1}
      </button>

      <div className="rutina-builder__exercise-identity">
        {editingExercise || !selected ? (
          <EjercicioAutocomplete
            ejercicios={ejercicios}
            value={selected?.nombre ?? ""}
            selectedId={draft.ejercicioId}
            disabled={disabled}
            autoFocus={editingExercise}
            onSelect={(ejercicio) => {
              onUpdate({ ejercicioId: ejercicio.id });
              setEditingExercise(false);
            }}
          />
        ) : (
          <button
            type="button"
            className="rutina-builder__exercise-name-btn"
            disabled={disabled}
            onClick={() => setEditingExercise(true)}
          >
            {selected.nombre}
          </button>
        )}

        <div className="rutina-builder__exercise-presets" role="group" aria-label="Presets rápidos">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="rutina-builder__exercise-preset"
              disabled={disabled}
              onClick={() =>
                onUpdate({
                  series: preset.series,
                  repeticiones: preset.repeticiones,
                  repeticionesPorSerie: undefined,
                  unidad: "repeticiones",
                })
              }
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="rutina-builder__exercise-modes">
          <div role="group" aria-label="Cómo se mide el ejercicio">
            <button
              type="button"
              className={`rutina-builder__exercise-preset${
                unidad === "repeticiones" ? " is-selected" : ""
              }`}
              aria-pressed={unidad === "repeticiones"}
              disabled={disabled}
              onClick={() => updateUnidad("repeticiones")}
            >
              Repeticiones
            </button>
            <button
              type="button"
              className={`rutina-builder__exercise-preset${
                unidad === "segundos" ? " is-selected" : ""
              }`}
              aria-pressed={unidad === "segundos"}
              disabled={disabled}
              onClick={() => updateUnidad("segundos")}
            >
              Segundos
            </button>
          </div>
          <div role="group" aria-label="Qué registra la alumna">
            <button
              type="button"
              className={`rutina-builder__exercise-preset${
                registro === "peso" ? " is-selected" : ""
              }`}
              aria-pressed={registro === "peso"}
              disabled={disabled}
              onClick={() => updateRegistro("peso")}
            >
              Peso
            </button>
            <button
              type="button"
              className={`rutina-builder__exercise-preset${
                registro === "check" ? " is-selected" : ""
              }`}
              aria-pressed={registro === "check"}
              disabled={disabled}
              onClick={() => updateRegistro("check")}
            >
              Check
            </button>
          </div>
        </div>
      </div>

      <div className="rutina-builder__exercise-metrics">
        <label className="rutina-builder__metric">
          <span>Series</span>
          <div className="rutina-builder__stepper">
            <button
              type="button"
              disabled={disabled || draft.series <= SERIES_MIN}
              onClick={() => updateSeries(draft.series - 1)}
              aria-label="Menos series"
            >
              −
            </button>
            <input
              type="number"
              min={SERIES_MIN}
              max={SERIES_MAX}
              value={draft.series}
              disabled={disabled}
              onChange={(event) =>
                updateSeries(Number(event.target.value))
              }
            />
            <button
              type="button"
              disabled={disabled || draft.series >= SERIES_MAX}
              onClick={() => updateSeries(draft.series + 1)}
              aria-label="Más series"
            >
              +
            </button>
          </div>
        </label>

        <div className="rutina-builder__metric rutina-builder__metric--reps">
          <span>{unidad === "segundos" ? "Seg" : "Reps"}</span>
          {perSetMode ? (
            <div
              className="rutina-builder__reps-por-serie"
              role="group"
              aria-label={
                unidad === "segundos"
                  ? "Segundos por serie"
                  : "Repeticiones por serie"
              }
            >
              {(draft.repeticionesPorSerie ?? []).map((value, serieIndex) => (
                <label
                  key={`serie-reps-${serieIndex}`}
                  className="rutina-builder__reps-por-serie-item"
                >
                  <span>S{serieIndex + 1}</span>
                  <input
                    type="number"
                    min={REPS_MIN}
                    max={maxPrescription}
                    value={value}
                    disabled={disabled}
                    aria-label={
                      unidad === "segundos"
                        ? `Segundos de la serie ${serieIndex + 1}`
                        : `Repeticiones de la serie ${serieIndex + 1}`
                    }
                    onChange={(event) =>
                      updateRepeticionPorSerie(
                        serieIndex,
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          ) : (
            <div className="rutina-builder__stepper">
              <button
                type="button"
                disabled={disabled || draft.repeticiones <= REPS_MIN}
                onClick={() => updateRepeticiones(draft.repeticiones - 1)}
                aria-label={
                  unidad === "segundos" ? "Menos segundos" : "Menos repeticiones"
                }
              >
                −
              </button>
              <input
                type="number"
                min={REPS_MIN}
                max={maxPrescription}
                value={draft.repeticiones}
                disabled={disabled}
                onChange={(event) =>
                  updateRepeticiones(Number(event.target.value))
                }
              />
              <button
                type="button"
                disabled={disabled || draft.repeticiones >= maxPrescription}
                onClick={() => updateRepeticiones(draft.repeticiones + 1)}
                aria-label={
                  unidad === "segundos" ? "Más segundos" : "Más repeticiones"
                }
              >
                +
              </button>
            </div>
          )}
          <button
            type="button"
            className="rutina-builder__reps-mode-toggle"
            disabled={disabled}
            onClick={perSetMode ? disablePerSetMode : enablePerSetMode}
          >
            {perSetMode
              ? unidad === "segundos"
                ? "Mismos segundos"
                : "Mismas reps"
              : unidad === "segundos"
                ? "Segundos distintos por serie"
                : "Reps distintas por serie"}
          </button>
        </div>

        <label className="rutina-builder__metric">
          <span>Descanso</span>
          <select
            className="rutina-builder__descanso-select"
            value={draft.descansoSegundos}
            disabled={disabled}
            onChange={(event) =>
              onUpdate({ descansoSegundos: Number(event.target.value) })
            }
          >
            {DESCANSO_OPTIONS.map((descanso) => (
              <option key={descanso} value={descanso}>
                {formatDescanso(descanso)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rutina-builder__exercise-row-actions">
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || !canRemove}
          onClick={onRemove}
          aria-label="Quitar ejercicio"
        >
          Quitar
        </Button>
      </div>
    </div>
  );
}
