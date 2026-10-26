"use client";

import { useState } from "react";
import { Button } from "@/components";
import { EjercicioAutocomplete } from "@/features/profe/components/EjercicioAutocomplete";
import type { BancoEjercicio } from "@/features/profe/hooks/useBancoEjercicios";
import type { EjercicioRutinaDraft } from "@/features/profe/lib/rutina-draft";
import {
  isRepeticionesPorSerieActive,
  REPS_MAX,
  REPS_MIN,
  resizeRepeticionesPorSerie,
  SERIES_MAX,
  SERIES_MIN,
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
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
  onUpdate: (patch: Partial<Omit<EjercicioRutinaDraft, "localId">>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function formatDescanso(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${seconds / 60} min`;
}

export function RutinaExerciseRow({
  draft,
  index,
  ejercicios,
  canRemove,
  canMoveUp,
  canMoveDown,
  disabled,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: RutinaExerciseRowProps) {
  const [editingExercise, setEditingExercise] = useState(!draft.ejercicioId);
  const selected = ejercicios.find((ejercicio) => ejercicio.id === draft.ejercicioId);
  const perSetMode = isRepeticionesPorSerieActive(
    draft.series,
    draft.repeticionesPorSerie,
  );

  function updateSeries(nextSeries: number) {
    const series = clamp(nextSeries, SERIES_MIN, SERIES_MAX);
    if (!perSetMode) {
      onUpdate({ series });
      return;
    }
    onUpdate({
      series,
      repeticionesPorSerie: resizeRepeticionesPorSerie(
        series,
        draft.repeticiones,
        draft.repeticionesPorSerie,
      ),
    });
  }

  function updateRepeticiones(nextRepeticiones: number) {
    onUpdate({
      repeticiones: clamp(nextRepeticiones, REPS_MIN, REPS_MAX),
      repeticionesPorSerie: undefined,
    });
  }

  function updateRepeticionPorSerie(serieIndex: number, nextValue: number) {
    const next = resizeRepeticionesPorSerie(
      draft.series,
      draft.repeticiones,
      draft.repeticionesPorSerie,
    );
    next[serieIndex] = clamp(nextValue, REPS_MIN, REPS_MAX);
    onUpdate({
      repeticiones: next[0] ?? draft.repeticiones,
      repeticionesPorSerie: next,
    });
  }

  function enablePerSetMode() {
    onUpdate({
      repeticionesPorSerie: resizeRepeticionesPorSerie(
        draft.series,
        draft.repeticiones,
        draft.repeticionesPorSerie,
      ),
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
      className={
        perSetMode
          ? "rutina-builder__exercise-row is-reps-por-serie"
          : "rutina-builder__exercise-row"
      }
    >
      <span className="rutina-builder__exercise-index">{index + 1}</span>

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
                })
              }
            >
              {preset.label}
            </button>
          ))}
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
          <span>Reps</span>
          {perSetMode ? (
            <div
              className="rutina-builder__reps-por-serie"
              role="group"
              aria-label="Repeticiones por serie"
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
                    max={REPS_MAX}
                    value={value}
                    disabled={disabled}
                    aria-label={`Repeticiones de la serie ${serieIndex + 1}`}
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
                aria-label="Menos repeticiones"
              >
                −
              </button>
              <input
                type="number"
                min={REPS_MIN}
                max={REPS_MAX}
                value={draft.repeticiones}
                disabled={disabled}
                onChange={(event) =>
                  updateRepeticiones(Number(event.target.value))
                }
              />
              <button
                type="button"
                disabled={disabled || draft.repeticiones >= REPS_MAX}
                onClick={() => updateRepeticiones(draft.repeticiones + 1)}
                aria-label="Más repeticiones"
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
            {perSetMode ? "Mismas reps" : "Reps distintas por serie"}
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
          disabled={disabled || !canMoveUp}
          onClick={onMoveUp}
          aria-label="Subir ejercicio"
        >
          ↑
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || !canMoveDown}
          onClick={onMoveDown}
          aria-label="Bajar ejercicio"
        >
          ↓
        </Button>
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
