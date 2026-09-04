import { profeRoutes } from "@/routes/paths";

export function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}

/** Coincidencia exacta, o prefijo para el laboratorio de planes. */
export function isNavLinkActive(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  if (current === target) return true;

  const labHref = normalizePath(profeRoutes.nuevaRutina);
  if (target === labHref && current.startsWith(`${labHref}/`)) {
    return true;
  }

  return false;
}

/** Devuelve el href del ítem de nav que corresponde a la ruta actual. */
export function getActiveNavHref(
  pathname: string,
  items: readonly { href: string }[],
): string | null {
  const match = items.find((item) => isNavLinkActive(pathname, item.href));
  return match?.href ?? null;
}
