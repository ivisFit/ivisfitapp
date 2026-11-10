import type { ModoPlan } from "@/lib/modo-plan";
import { alumnaRoutes, profeRoutes, sharedRoutes } from "@/routes/paths";

export type NavIconId =
  | "home"
  | "routine"
  | "progress"
  | "nutrition"
  | "settings"
  | "panel"
  | "exercises"
  | "students"
  | "newRoutine"
  | "admissions"
  | "dumbbell"
  | "flask"
  | "play"
  | "logout"
  | "measure"
  | "globe"
  | "chat"
  | "foodCatalog"
  | "trophy"
  | "calendar"
  | "user"
  | "library"
  | "sparkles"
  | "more";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconId;
  shortLabel?: string;
  badgeKey?: "admisiones";
};

export const alumnaPlieguesNavItem: NavItem = {
  href: alumnaRoutes.pliegues,
  label: "Pliegues",
  icon: "measure",
  shortLabel: "Pliegues",
};

export const alumnaCircunferenciasNavItem: NavItem = {
  href: alumnaRoutes.circunferencias,
  label: "Circunferencias",
  icon: "measure",
  shortLabel: "Medición",
};

export const ajustesNavItem: NavItem = {
  href: sharedRoutes.ajustes,
  label: "Ajustes",
  icon: "settings",
  shortLabel: "Ajustes",
};

/** Bottom nav móvil: 3 ítems core + Asistente en menú "Más" */
export const alumnaBottomNav: NavItem[] = [
  { href: alumnaRoutes.rutina, label: "Mi rutina", icon: "routine", shortLabel: "Rutina" },
  {
    href: alumnaRoutes.alimentacion,
    label: "Alimentación",
    icon: "nutrition",
    shortLabel: "Comida",
  },
  { href: alumnaRoutes.progreso, label: "Progreso", icon: "progress" },
];

/** Bottom sheet "Más" en mobile alumna */
export const alumnaMobileMoreNav: NavItem[] = [
  {
    href: alumnaRoutes.asistente,
    label: "Asistente",
    icon: "sparkles",
    shortLabel: "Asistente",
  },
  { href: alumnaRoutes.mensajes, label: "Mensajes", icon: "chat" },
  {
    href: alumnaRoutes.biblioteca,
    label: "Biblioteca",
    icon: "library",
    shortLabel: "Videos",
  },
  { href: alumnaRoutes.logros, label: "Logros", icon: "trophy" },
  { href: alumnaRoutes.miPerfil, label: "Mi perfil", icon: "user" },
  { href: sharedRoutes.ajustes, label: "Ajustes", icon: "settings" },
];

export const alumnaNav: NavItem[] = [
  { href: alumnaRoutes.rutina, label: "Mi rutina", icon: "routine", shortLabel: "Rutina" },
  {
    href: alumnaRoutes.alimentacion,
    label: "Alimentación",
    icon: "nutrition",
    shortLabel: "Comida",
  },
  { href: alumnaRoutes.progreso, label: "Progreso", icon: "progress" },
  {
    href: alumnaRoutes.mensajes,
    label: "Mensajes",
    icon: "chat",
    shortLabel: "Msgs",
  },
  {
    href: alumnaRoutes.biblioteca,
    label: "Biblioteca",
    icon: "library",
    shortLabel: "Videos",
  },
  { href: alumnaRoutes.logros, label: "Logros", icon: "trophy", shortLabel: "Logros" },
  { href: alumnaRoutes.miPerfil, label: "Mi perfil", icon: "user", shortLabel: "Perfil" },
];

/** Bottom nav profe: 4 ítems + Más (Agenda y Web en el sheet) */
export const profeBottomNav: NavItem[] = [
  { href: profeRoutes.panel, label: "Panel", icon: "home" },
  {
    href: profeRoutes.alumnas,
    label: "Alumnas",
    icon: "students",
    badgeKey: "admisiones",
  },
  {
    href: profeRoutes.nuevaRutina,
    label: "Laboratorio de planes",
    icon: "flask",
    shortLabel: "Lab",
  },
  {
    href: profeRoutes.catalogo,
    label: "Catálogo",
    icon: "dumbbell",
    shortLabel: "Catálogo",
  },
];

/** Bottom sheet "Más" en mobile profe */
export const profeMobileMoreNav: NavItem[] = [
  {
    href: profeRoutes.agenda,
    label: "Agenda",
    icon: "calendar",
    shortLabel: "Agenda",
  },
  {
    href: profeRoutes.webConfig,
    label: "Web",
    icon: "globe",
    shortLabel: "Web",
  },
];

export const profeNav: NavItem[] = [
  { href: profeRoutes.panel, label: "Panel", icon: "home" },
  {
    href: profeRoutes.alumnas,
    label: "Alumnas",
    icon: "students",
    badgeKey: "admisiones",
  },
  {
    href: profeRoutes.nuevaRutina,
    label: "Laboratorio de planes",
    icon: "flask",
    shortLabel: "Lab. planes",
  },
  {
    href: profeRoutes.catalogo,
    label: "Catálogo",
    icon: "dumbbell",
    shortLabel: "Catálogo",
  },
  {
    href: profeRoutes.webConfig,
    label: "Web",
    icon: "globe",
    shortLabel: "Web",
  },
  {
    href: profeRoutes.agenda,
    label: "Agenda",
    icon: "calendar",
    shortLabel: "Agenda",
  },
];

const RUTINA_NAV_HREFS = new Set<string>([
  alumnaRoutes.rutina,
  alumnaRoutes.biblioteca,
]);

const ALIMENTACION_NAV_HREFS = new Set<string>([alumnaRoutes.alimentacion]);

export function getAlumnaMobileMoreNav(options?: {
  tienePliegues?: boolean;
  circunferenciasHabilitadas?: boolean;
}): NavItem[] {
  const next = [...alumnaMobileMoreNav];
  const logrosIndex = next.findIndex((item) => item.href === alumnaRoutes.logros);
  const insertAt = logrosIndex >= 0 ? logrosIndex + 1 : next.length;
  const extras: NavItem[] = [];
  if (options?.tienePliegues) extras.push(alumnaPlieguesNavItem);
  if (options?.circunferenciasHabilitadas) extras.push(alumnaCircunferenciasNavItem);
  next.splice(insertAt, 0, ...extras);
  return next;
}

export function filterNavByModoPlan(items: NavItem[], modoPlan?: ModoPlan): NavItem[] {
  if (modoPlan === "alimentacion") {
    return items.filter((item) => !RUTINA_NAV_HREFS.has(item.href));
  }
  if (modoPlan === "rutina") {
    return items.filter((item) => !ALIMENTACION_NAV_HREFS.has(item.href));
  }
  return items;
}

export function getSidebarNav(
  role: "profe" | "alumna",
  options?: {
    circunferenciasHabilitadas?: boolean | undefined;
    tienePliegues?: boolean | undefined;
    soloAlimentacion?: boolean | undefined;
    modoPlan?: ModoPlan | undefined;
  },
): NavItem[] {
  const modoPlan =
    options?.modoPlan ?? (options?.soloAlimentacion ? "alimentacion" : "ambos");
  const items =
    role === "profe"
      ? [...profeNav]
      : filterNavByModoPlan([...alumnaNav], modoPlan);

  if (role === "alumna" && options?.tienePliegues) {
    items.push(alumnaPlieguesNavItem);
  }

  if (role === "alumna" && options?.circunferenciasHabilitadas) {
    items.push(alumnaCircunferenciasNavItem);
  }

  items.push(ajustesNavItem);
  return items;
}
