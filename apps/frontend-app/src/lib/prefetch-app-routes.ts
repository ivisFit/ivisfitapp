import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const ALUMNA_ROUTES = ["/rutina", "/alimentacion", "/progreso"] as const;
const PROFE_ROUTES = ["/panel", "/alumnas", "/agenda"] as const;

/**
 * Warms likely post-login routes in the Next.js router cache.
 */
export function prefetchPostLoginRoutes(
  router: AppRouterInstance,
  role?: "profe" | "alumna" | null,
): void {
  const routes =
    role === "profe"
      ? PROFE_ROUTES
      : role === "alumna"
        ? ALUMNA_ROUTES
        : [...ALUMNA_ROUTES, ...PROFE_ROUTES];

  for (const href of routes) {
    try {
      router.prefetch(href);
    } catch {
      // prefetch is best-effort
    }
  }
}
