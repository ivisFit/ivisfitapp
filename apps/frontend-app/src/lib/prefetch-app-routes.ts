import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ModoPlan } from "@/lib/modo-plan";

const ALUMNA_ROUTES = ["/rutina", "/alimentacion", "/progreso"] as const;
const PROFE_ROUTES = ["/panel", "/alumnas", "/agenda"] as const;

/**
 * Warms likely post-login routes in the Next.js router cache.
 */
export function prefetchPostLoginRoutes(
  router: AppRouterInstance,
  role?: "profe" | "alumna" | null,
  modoPlan?: ModoPlan,
): void {
  const alumnaRoutes =
    modoPlan === "alimentacion"
      ? ALUMNA_ROUTES.filter((href) => href === "/alimentacion")
      : modoPlan === "rutina"
        ? ALUMNA_ROUTES.filter((href) => href !== "/alimentacion")
        : ALUMNA_ROUTES;
  const routes =
    role === "profe"
      ? PROFE_ROUTES
      : role === "alumna"
        ? alumnaRoutes
        : [...alumnaRoutes, ...PROFE_ROUTES];

  for (const href of routes) {
    try {
      router.prefetch(href);
    } catch {
      // prefetch is best-effort
    }
  }
}
