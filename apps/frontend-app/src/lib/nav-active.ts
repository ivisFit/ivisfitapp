export function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.replace(/\/$/, "") || "/";
}

/** Coincidencia exacta con la URL actual. */
export function isNavLinkActive(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href);
}

/** Devuelve el href del ítem de nav que corresponde a la ruta actual. */
export function getActiveNavHref(
  pathname: string,
  items: readonly { href: string }[],
): string | null {
  const match = items.find((item) => isNavLinkActive(pathname, item.href));
  return match?.href ?? null;
}
