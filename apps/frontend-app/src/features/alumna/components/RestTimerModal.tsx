"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatTimerSeconds } from "@/features/alumna/lib/rutina-day";

type RestTimerModalProps = {
  ejercicioNombre: string;
  descansoSegundos: number;
  onClose: () => void;
};

const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function RestTimerModal({
  ejercicioNombre,
  descansoSegundos,
  onClose,
}: RestTimerModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(descansoSegundos);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress =
    descansoSegundos > 0 ? secondsLeft / descansoSegundos : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - progress);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setIsRunning(true);
    setIsFinished(false);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearTimer();
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setSecondsLeft(descansoSegundos);
    setIsFinished(false);
    startTimer();
  }, [clearTimer, descansoSegundos, startTimer]);

  useEffect(() => {
    setSecondsLeft(descansoSegundos);
    setIsFinished(false);
    startTimer();

    return clearTimer;
  }, [clearTimer, descansoSegundos, ejercicioNombre, startTimer]);

  return (
    <div className="rest-timer" role="dialog" aria-modal="true" aria-labelledby="rest-timer-title">
      <button
        className="rest-timer__backdrop"
        type="button"
        aria-label="Cerrar temporizador"
        onClick={onClose}
      />
      <article className="rest-timer__panel">
        <div className="rest-timer__header">
          <div>
            <span>Descanso entre series</span>
            <h3 id="rest-timer-title">{ejercicioNombre}</h3>
          </div>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="rest-timer__clock" aria-live="polite">
          <svg
            className="rest-timer__ring"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <circle
              className="rest-timer__ring-track"
              cx="100"
              cy="100"
              r={RING_RADIUS}
            />
            <circle
              className="rest-timer__ring-progress"
              cx="100"
              cy="100"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="rest-timer__time">
            {isFinished ? (
              <span className="rest-timer__finished">¡Descanso terminado!</span>
            ) : (
              <time dateTime={`PT${secondsLeft}S`}>
                {formatTimerSeconds(secondsLeft)}
              </time>
            )}
          </div>
        </div>

        <div className="rest-timer__controls">
          {isFinished ? (
            <button type="button" className="rest-timer__primary" onClick={resetTimer}>
              Reiniciar
            </button>
          ) : isRunning ? (
            <button type="button" className="rest-timer__secondary" onClick={pauseTimer}>
              Pausar
            </button>
          ) : (
            <button type="button" className="rest-timer__primary" onClick={startTimer}>
              Reanudar
            </button>
          )}
          {!isFinished ? (
            <button type="button" className="rest-timer__secondary" onClick={resetTimer}>
              Reiniciar
            </button>
          ) : null}
        </div>
      </article>
    </div>
  );
}
