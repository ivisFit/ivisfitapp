"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { prefersReducedMotion } from "@/features/auth/components/auth-transition";
import { EvaluacionBridgeOverlay } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeOverlay";
import type { BridgeDirection } from "@/features/alumna/components/evaluacion-bridge/EvaluacionBridgeOverlay";
import {
  EVALUACION_BRIDGE_HANDOFF_MAX_WAIT_MS,
  EVALUACION_BRIDGE_HANDOFF_MS,
  EVALUACION_BRIDGE_HANDOFF_START_MS,
  EVALUACION_BRIDGE_NAVIGATE_MS,
  EVALUACION_BRIDGE_WELCOME_HOLD_MS,
} from "@/features/alumna/components/evaluacion-bridge/evaluacion-bridge-transition";

export type { BridgeDirection };

type RunBridgeTransition = (
  direction: BridgeDirection,
  targetPath: string,
  navigate: () => void,
) => void;

const EvaluacionBridgeContext = createContext<RunBridgeTransition | null>(null);

export function useEvaluacionBridgeTransition(): RunBridgeTransition {
  const context = useContext(EvaluacionBridgeContext);
  if (!context) {
    throw new Error(
      "useEvaluacionBridgeTransition must be used within EvaluacionBridgeProvider",
    );
  }
  return context;
}

type EvaluacionBridgeProviderProps = {
  children: ReactNode;
};

type ActiveBridge = {
  direction: BridgeDirection;
  targetPath: string;
  elapsedMs: number;
  handoffElapsedMs: number;
  reducedMotion: boolean;
};

const canUseDom = typeof document !== "undefined";

function normalizePath(path: string): string {
  const base = path.split("?")[0]?.split("#")[0] ?? path;
  if (base.length > 1 && base.endsWith("/")) {
    return base.slice(0, -1);
  }
  return base;
}

export function EvaluacionBridgeProvider({
  children,
}: EvaluacionBridgeProviderProps) {
  const pathname = usePathname();
  const [activeBridge, setActiveBridge] = useState<ActiveBridge | null>(null);
  const busyRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const navigateRef = useRef<(() => void) | null>(null);
  const navigatedRef = useRef(false);
  const routeReadyRef = useRef(false);
  const handoffStartedAtRef = useRef<number | null>(null);
  const targetPathRef = useRef<string | null>(null);

  const finishBridge = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setActiveBridge(null);
    busyRef.current = false;
    navigateRef.current = null;
    navigatedRef.current = false;
    routeReadyRef.current = false;
    handoffStartedAtRef.current = null;
    targetPathRef.current = null;
  }, []);

  useEffect(() => {
    if (!targetPathRef.current) return;
    if (normalizePath(pathname) === normalizePath(targetPathRef.current)) {
      routeReadyRef.current = true;
    }
  }, [pathname]);

  const runBridgeTransition = useCallback<RunBridgeTransition>(
    (direction, targetPath, navigate) => {
      if (busyRef.current) {
        navigate();
        return;
      }

      if (typeof window === "undefined") {
        navigate();
        return;
      }

      busyRef.current = true;
      navigateRef.current = navigate;
      navigatedRef.current = false;
      routeReadyRef.current = false;
      handoffStartedAtRef.current = null;
      targetPathRef.current = targetPath;

      flushSync(() => {
        setActiveBridge({
          direction,
          targetPath,
          elapsedMs: 0,
          handoffElapsedMs: 0,
          reducedMotion: prefersReducedMotion(),
        });
      });
    },
    [],
  );

  useLayoutEffect(() => {
    if (!activeBridge) return;

    const reducedMotion = activeBridge.reducedMotion;
    const startedAt = performance.now();
    const minHandoffAt = reducedMotion
      ? EVALUACION_BRIDGE_WELCOME_HOLD_MS
      : EVALUACION_BRIDGE_HANDOFF_START_MS;
    const maxHandoffAt = minHandoffAt + EVALUACION_BRIDGE_HANDOFF_MAX_WAIT_MS;
    const navigateMs = reducedMotion
      ? EVALUACION_BRIDGE_WELCOME_HOLD_MS
      : EVALUACION_BRIDGE_NAVIGATE_MS;
    const totalMs = reducedMotion
      ? EVALUACION_BRIDGE_WELCOME_HOLD_MS
      : maxHandoffAt + EVALUACION_BRIDGE_HANDOFF_MS;

    const tick = (now: number) => {
      const elapsed = now - startedAt;

      if (elapsed >= navigateMs && !navigatedRef.current) {
        navigatedRef.current = true;
        navigateRef.current?.();
      }

      const canStartHandoff =
        navigatedRef.current &&
        elapsed >= minHandoffAt &&
        (routeReadyRef.current || elapsed >= maxHandoffAt);

      if (canStartHandoff && handoffStartedAtRef.current === null) {
        handoffStartedAtRef.current = now;
      }

      const handoffElapsed =
        handoffStartedAtRef.current === null
          ? 0
          : now - handoffStartedAtRef.current;

      setActiveBridge((current) =>
        current
          ? {
              ...current,
              elapsedMs: elapsed,
              handoffElapsedMs: handoffElapsed,
            }
          : null,
      );

      if (handoffElapsed >= EVALUACION_BRIDGE_HANDOFF_MS) {
        finishBridge();
        return;
      }

      if (elapsed < totalMs || handoffStartedAtRef.current !== null) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        finishBridge();
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [activeBridge?.direction, activeBridge?.reducedMotion, finishBridge]);

  return (
    <EvaluacionBridgeContext.Provider value={runBridgeTransition}>
      {children}
      {canUseDom && activeBridge
        ? createPortal(
            <EvaluacionBridgeOverlay
              direction={activeBridge.direction}
              elapsedMs={activeBridge.elapsedMs}
              handoffElapsedMs={activeBridge.handoffElapsedMs}
              reducedMotion={activeBridge.reducedMotion}
            />,
            document.body,
          )
        : null}
    </EvaluacionBridgeContext.Provider>
  );
}
