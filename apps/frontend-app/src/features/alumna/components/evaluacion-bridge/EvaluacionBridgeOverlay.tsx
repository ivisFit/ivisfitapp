"use client";

import Image from "next/image";
import iconIvis from "@/iconIvis.png";
import {
  easeOutCubic,
  EVALUACION_BRIDGE_ENTER_MS,
  EVALUACION_BRIDGE_HANDOFF_MS,
  phaseProgressMs,
} from "@/features/alumna/components/evaluacion-bridge/evaluacion-bridge-transition";

export type BridgeDirection = "toEvaluacion" | "toAlimentacion";

const BRIDGE_COPY: Record<
  BridgeDirection,
  { title: string; subtitle: string }
> = {
  toEvaluacion: {
    title: "Vamos a conocerte",
    subtitle: "Preparando tu evaluación nutricional...",
  },
  toAlimentacion: {
    title: "¡Todo listo!",
    subtitle: "Preparando tu espacio de alimentación...",
  },
};

type EvaluacionBridgeOverlayProps = {
  direction: BridgeDirection;
  elapsedMs: number;
  handoffElapsedMs: number;
  reducedMotion?: boolean;
};

export function EvaluacionBridgeOverlay({
  direction,
  elapsedMs,
  handoffElapsedMs,
  reducedMotion = false,
}: EvaluacionBridgeOverlayProps) {
  const copy = BRIDGE_COPY[direction];

  const overlayEnter = easeOutCubic(
    phaseProgressMs(elapsedMs, 0, EVALUACION_BRIDGE_ENTER_MS),
  );
  const overlayExit = easeOutCubic(
    phaseProgressMs(handoffElapsedMs, 0, EVALUACION_BRIDGE_HANDOFF_MS),
  );
  const overlayOpacity =
    handoffElapsedMs > 0 ? 1 - overlayExit : overlayEnter;

  const contentEnter = easeOutCubic(
    phaseProgressMs(elapsedMs, 80, EVALUACION_BRIDGE_ENTER_MS + 120),
  );
  const contentExit = easeOutCubic(
    phaseProgressMs(handoffElapsedMs, 0, EVALUACION_BRIDGE_HANDOFF_MS),
  );
  const contentOpacity = contentEnter * (1 - contentExit);
  const contentTranslateY = (1 - contentEnter) * 14 - contentExit * 8;
  const contentScale = 0.98 + contentEnter * 0.02 - contentExit * 0.01;
  const glowScale = 0.85 + contentEnter * 0.15;

  return (
    <div
      className={`evaluacion-bridge${handoffElapsedMs > 0 ? " evaluacion-bridge--handoff" : ""}${reducedMotion ? " evaluacion-bridge--reduced" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={copy.subtitle}
      style={{ opacity: overlayOpacity }}
    >
      <div
        className="evaluacion-bridge__glow"
        aria-hidden="true"
        style={{
          opacity: contentOpacity * 0.9,
          transform: `translate(-50%, -50%) scale(${glowScale})`,
        }}
      />
      <div
        className="evaluacion-bridge__content"
        style={{
          opacity: contentOpacity,
          transform: `translateY(${contentTranslateY}px) scale(${contentScale})`,
        }}
      >
        <div className="evaluacion-bridge__logo-wrap">
          <Image
            src={iconIvis}
            alt=""
            className="evaluacion-bridge__logo"
            priority
            sizes="5.5rem"
          />
        </div>
        <h2 className="evaluacion-bridge__title">{copy.title}</h2>
        <p className="evaluacion-bridge__subtitle">{copy.subtitle}</p>
        {!reducedMotion ? (
          <div className="evaluacion-bridge__spinner" aria-hidden="true" />
        ) : null}
      </div>
    </div>
  );
}
