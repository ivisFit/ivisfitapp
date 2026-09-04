import {
  alumnaRoutes,
  getHomeRouteForRole,
  profeRoutes,
  publicRoutes,
  sharedRoutes,
} from "@/routes/paths";
import type { AuthUser, UserRole } from "@/types/auth";

export const AUTH_RETURN_TO_PARAM = "returnTo";

const AUTH_ROUTES = new Set<string>([
  publicRoutes.login,
  publicRoutes.registro,
  publicRoutes.solicitudPendiente,
  publicRoutes.recuperar,
  publicRoutes.restablecer,
]);

const PROFE_ROUTE_PREFIXES = [
  profeRoutes.panel,
  profeRoutes.admisiones,
  profeRoutes.catalogo,
  profeRoutes.ejercicios,
  profeRoutes.gestionAlimentos,
  profeRoutes.alumnas,
  profeRoutes.nuevaRutina,
  profeRoutes.webConfig,
  profeRoutes.agenda,
  profeRoutes.leadsChatbot,
  profeRoutes.animaciones,
  sharedRoutes.ajustes,
] as const;

const ALUMNA_ROUTE_PREFIXES = [
  alumnaRoutes.rutina,
  alumnaRoutes.alimentacion,
  alumnaRoutes.evaluacionNutricional,
  alumnaRoutes.progreso,
  alumnaRoutes.circunferencias,
  alumnaRoutes.tutoriales,
  alumnaRoutes.logros,
  alumnaRoutes.bienvenida,
  alumnaRoutes.asistente,
  alumnaRoutes.reunion,
  alumnaRoutes.miPerfil,
  alumnaRoutes.mensajes,
  alumnaRoutes.biblioteca,
  sharedRoutes.ajustes,
] as const;

export function normalizeRoute(path: string): string {
  const withoutHash = path.split("#")[0] ?? path;
  const base = withoutHash.split("?")[0] ?? withoutHash;
  if (base.length > 1 && base.endsWith("/")) {
    return base.slice(0, -1);
  }
  return base;
}

export function isAuthRoute(path: string): boolean {
  const normalized = normalizeRoute(path);
  if (AUTH_ROUTES.has(normalized)) {
    return true;
  }

  return normalized.startsWith("/login/");
}

function matchesRoutePrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isReturnPathAllowed(path: string, role: UserRole): boolean {
  const normalized = normalizeRoute(path);

  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return false;
  }

  if (isAuthRoute(normalized)) {
    return false;
  }

  const prefixes = role === "profe" ? PROFE_ROUTE_PREFIXES : ALUMNA_ROUTE_PREFIXES;
  return prefixes.some((prefix) => matchesRoutePrefix(normalized, prefix));
}

export function buildLoginUrl(returnTo?: string | null): string {
  if (!returnTo) {
    return publicRoutes.login;
  }

  const normalized = normalizeRoute(returnTo);
  if (isAuthRoute(normalized)) {
    return publicRoutes.login;
  }

  return `${publicRoutes.login}?${AUTH_RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`;
}

export function resolvePostAuthRoute(user: AuthUser, returnTo?: string | null): string {
  if (user.role === "alumna" && user.admissionStatus !== "admitida") {
    return publicRoutes.solicitudPendiente;
  }

  const needsOnboarding =
    user.role === "alumna" &&
    user.admissionStatus === "admitida" &&
    user.onboardingCompletado !== true;

  if (
    needsOnboarding &&
    !(returnTo && matchesRoutePrefix(normalizeRoute(returnTo), alumnaRoutes.bienvenida))
  ) {
    return alumnaRoutes.bienvenida;
  }

  if (returnTo && isReturnPathAllowed(returnTo, user.role)) {
    const path = normalizeRoute(returnTo);
    const suffixStart = returnTo.search(/[?#]/);
    const suffix = suffixStart >= 0 ? returnTo.slice(suffixStart) : "";
    return `${path}${suffix}`;
  }

  return getHomeRouteForRole(user.role);
}
