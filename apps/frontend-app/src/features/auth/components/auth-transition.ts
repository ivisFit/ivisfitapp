import { publicRoutes } from "@/routes/paths";

export const AUTH_FLIP_TRANSITION_MS = 650;

export type AuthFlipRoute =
  | typeof publicRoutes.login
  | typeof publicRoutes.registro;

export function normalizeAuthPath(path: string): string {
  const base = path.split("?")[0]?.split("#")[0] ?? path;
  if (base.length > 1 && base.endsWith("/")) {
    return base.slice(0, -1);
  }
  return base;
}

export function isAuthFlipRoute(href: string): href is AuthFlipRoute {
  const path = normalizeAuthPath(href);
  return path === publicRoutes.login || path === publicRoutes.registro;
}

export function isAuthFlipPair(from: string, to: string): boolean {
  const fromPath = normalizeAuthPath(from);
  const toPath = normalizeAuthPath(to);
  return (
    isAuthFlipRoute(fromPath) &&
    isAuthFlipRoute(toPath) &&
    fromPath !== toPath
  );
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function easeAuthFlip(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}
