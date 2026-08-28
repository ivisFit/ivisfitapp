import { prefersReducedMotion } from "@/features/auth/components/auth-transition";

export { prefersReducedMotion };

export const LOGIN_ENTER_WELCOME_HOLD_MS = 2500;
export const LOGIN_ENTER_MORPH_MS = 2000;
export const LOGIN_ENTER_HANDOFF_MS = 500;
export const LOGIN_ENTER_TOTAL_MS =
  LOGIN_ENTER_WELCOME_HOLD_MS + LOGIN_ENTER_MORPH_MS + LOGIN_ENTER_HANDOFF_MS;
export const LOGIN_ENTER_NAVIGATE_MS = 1200;
export const LOGIN_ENTER_HANDOFF_START_MS =
  LOGIN_ENTER_WELCOME_HOLD_MS + LOGIN_ENTER_MORPH_MS;
export const LOGIN_ENTER_HANDOFF_MAX_WAIT_MS = 2000;
export const LOGIN_ENTER_MORPH_START_MS = LOGIN_ENTER_WELCOME_HOLD_MS;
export const LOGIN_ENTER_MOBILE_FADE_MS = 400;
export const LOGIN_ENTER_HANDOFF_KEY = "ivis:login-enter-handoff";
export const LOGIN_ENTER_TARGET_KEY = "ivis:login-enter-target";
export const LOGIN_ENTER_DESKTOP_MIN_WIDTH = 768;
export const LOGIN_ENTER_WELCOME_FADE_MS = 500;

export type TransitionRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export const LOGIN_ENTER_PHASES = {
  morphStart: LOGIN_ENTER_MORPH_START_MS,
  backgroundFadeEnd: LOGIN_ENTER_MORPH_START_MS + 500,
  contentSwapStart: LOGIN_ENTER_MORPH_START_MS + 200,
  contentSwapEnd: LOGIN_ENTER_MORPH_START_MS + 900,
  sidebarMorphEnd: LOGIN_ENTER_MORPH_START_MS + 1000,
  dashboardRevealStart: LOGIN_ENTER_MORPH_START_MS + 400,
  dashboardRevealEnd: LOGIN_ENTER_MORPH_START_MS + 1700,
  handoffStart: LOGIN_ENTER_HANDOFF_START_MS,
  totalEnd: LOGIN_ENTER_TOTAL_MS,
} as const;

export function domRectToTransitionRect(rect: DOMRect): TransitionRect {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function parseCSSValue(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (trimmed.endsWith("px")) {
    return Number.parseFloat(trimmed);
  }

  if (trimmed.endsWith("rem")) {
    const rem = Number.parseFloat(trimmed);
    const rootSize =
      Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      ) || 16;
    return rem * rootSize;
  }

  return Number.parseFloat(trimmed) || 0;
}

export function getSidebarTargetRect(): TransitionRect {
  const style = getComputedStyle(document.documentElement);
  const sidebarWidth = parseCSSValue(
    style.getPropertyValue("--sidebar-width") || "312px",
  );
  const sidebarInset = parseCSSValue(
    style.getPropertyValue("--sidebar-inset") || "0.75rem",
  );
  const width = sidebarWidth - sidebarInset * 2;
  const height = window.innerHeight - sidebarInset * 2;

  return {
    top: sidebarInset,
    left: sidebarInset,
    width,
    height,
  };
}

export function interpolateRect(
  from: TransitionRect,
  to: TransitionRect,
  t: number,
): TransitionRect {
  const eased = easeOutCubic(t);
  return {
    top: from.top + (to.top - from.top) * eased,
    left: from.left + (to.left - from.left) * eased,
    width: from.width + (to.width - from.width) * eased,
    height: from.height + (to.height - from.height) * eased,
  };
}

export function phaseProgressMs(
  elapsedMs: number,
  startMs: number,
  endMs: number,
): number {
  if (elapsedMs <= startMs) return 0;
  if (elapsedMs >= endMs) return 1;
  return (elapsedMs - startMs) / (endMs - startMs);
}

export function phaseProgress(
  progress: number,
  start: number,
  end: number,
): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function isDesktopTransitionViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= LOGIN_ENTER_DESKTOP_MIN_WIDTH;
}

export function getStaggerOpacityMs(
  elapsedMs: number,
  index: number,
  startMs: number,
  endMs: number,
  staggerStepMs = 80,
): number {
  const itemStart = startMs + index * staggerStepMs;
  const itemEnd = endMs + index * staggerStepMs;
  return easeOutCubic(phaseProgressMs(elapsedMs, itemStart, itemEnd));
}
