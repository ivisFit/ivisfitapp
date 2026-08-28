"use client";

import { useEffect, useMemo, useState } from "react";
import type { SaveStatus } from "@/features/alumna/hooks/useSaveLogPeso";
import type { RutinaEjercicio } from "@/features/alumna/types/rutina";
import type { UpsertLogPesoPayload } from "@/features/alumna/types/log-peso";

type ExerciseWeightLogProps = {
  ejercicio: RutinaEjercicio;
  rutinaId: string;
  semana: number;
  dia: string;
  initialPesos?: number[];
  historicoPesos?: number[];
  disabled?: boolean;
  variant?: "story" | "sheet";
  saveStatus?: SaveStatus;
  onPesosChange: (payload: UpsertLogPesoPayload) => void;
};

function formatWeightNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(/\.0$/, "");
}

function buildSeriesValues(
  seriesCount: number,
  initialPesos?: number[],
  historicoPesos?: number[],
): string[] {
  return Array.from({ length: seriesCount }, (_, index) => {
    const saved = initialPesos?.[index];
    if (saved !== undefined && !Number.isNaN(saved)) {
      return formatWeightNumber(saved);
    }

    const last = historicoPesos?.[index];
    if (last !== undefined && !Number.isNaN(last) && last >= 0) {
      return formatWeightNumber(last);
    }

    return "";
  });
}

function parsePesosPorSerie(values: string[]): number[] {
  return values
    .map((value) => value.trim())
    .filter((value) => value !== "")
    .map((value) => Number.parseFloat(value))
    .filter((value) => !Number.isNaN(value) && value >= 0);
}

function getInputWidth(value: string): string {
  const length = Math.max(value.length, 1);
  return `${length}ch`;
}

function sanitizeWeightInput(raw: string): string {
  const normalized = raw.replace(",", ".");
  const digitsOnly = normalized.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = digitsOnly.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("")}`;
}

function adjustWeightValue(current: string, delta: number): string {
  const parsed = current.trim() === "" ? 0 : Number.parseFloat(current);
  const base = Number.isNaN(parsed) ? 0 : parsed;
  return formatWeightNumber(Math.max(0, base + delta));
}

export function ExerciseWeightLog({
  ejercicio,
  rutinaId,
  semana,
  dia,
  initialPesos,
  historicoPesos,
  disabled = false,
  variant = "story",
  saveStatus = "idle",
  onPesosChange,
}: ExerciseWeightLogProps) {
  const seriesCount = Math.min(Math.max(ejercicio.series, 1), 8);
  const [values, setValues] = useState<string[]>(() =>
    buildSeriesValues(seriesCount, initialPesos, historicoPesos),
  );

  useEffect(() => {
    setValues(buildSeriesValues(seriesCount, initialPesos, historicoPesos));
  }, [
    ejercicio.id,
    seriesCount,
    JSON.stringify(initialPesos),
    JSON.stringify(historicoPesos),
  ]);

  const statusLabel = useMemo(() => {
    if (disabled) return null;
    if (saveStatus === "saving") return "Guardando…";
    if (saveStatus === "saved") return "Guardado";
    if (saveStatus === "error") return "No se pudo guardar";
    return null;
  }, [disabled, saveStatus]);

  function commitValues(nextValues: string[]) {
    setValues(nextValues);

    const pesosPorSerie = parsePesosPorSerie(nextValues);
    if (pesosPorSerie.length === 0) return;

    onPesosChange({
      rutinaId,
      ejercicioId: ejercicio.id,
      semana,
      dia,
      pesosPorSerie,
    });
  }

  function handleChange(index: number, nextValue: string) {
    if (disabled) return;

    const sanitized = sanitizeWeightInput(nextValue);
    const nextValues = [...values];
    nextValues[index] = sanitized;
    commitValues(nextValues);
  }

  function adjustWeight(index: number, delta: number) {
    if (disabled) return;

    const nextValues = [...values];
    nextValues[index] = adjustWeightValue(values[index] ?? "", delta);
    commitValues(nextValues);
  }

  return (
    <div
      className={`weight-log weight-log--${variant}${disabled ? " is-disabled" : ""}`}
    >
      <div className="weight-log__header">
        <span className="weight-log__scheme">
          {ejercicio.series} x {ejercicio.repeticiones}
        </span>
        {statusLabel ? (
          <span
            className={`weight-log__status weight-log__status--${saveStatus}`}
            aria-live="polite"
          >
            {statusLabel}
          </span>
        ) : null}
      </div>

      <div
        className="weight-log__grid"
        role="group"
        aria-label={`Pesos por serie de ${ejercicio.nombre}`}
      >
        {Array.from({ length: seriesCount }, (_, index) => {
          const value = values[index] ?? "";

          return (
            <div className="weight-log__field" key={`serie-${index + 1}`}>
              <span className="weight-log__field-label">
                Peso de la serie ({index + 1})
              </span>
              <div className="weight-log__input-row">
                <button
                  type="button"
                  className="weight-log__step-btn"
                  aria-label={`Restar 1 kg en la serie ${index + 1}`}
                  disabled={disabled}
                  onClick={() => adjustWeight(index, -1)}
                >
                  −
                </button>

                <div className="weight-log__input-wrap">
                  <div className="weight-log__value">
                    <input
                      className="weight-log__input"
                      type="text"
                      inputMode="decimal"
                      enterKeyHint="done"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder=""
                      style={{ width: getInputWidth(value) }}
                      value={value}
                      disabled={disabled}
                      aria-label={`Peso de la serie ${index + 1}`}
                      onChange={(event) => handleChange(index, event.target.value)}
                    />
                    <span className="weight-log__unit" aria-hidden="true">
                      kg
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="weight-log__step-btn"
                  aria-label={`Sumar 1 kg en la serie ${index + 1}`}
                  disabled={disabled}
                  onClick={() => adjustWeight(index, 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
