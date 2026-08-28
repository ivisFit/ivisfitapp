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

/** Bottom nav profe: 5 ítems (Automatizaciones y Catálogo solo en sidebar) */
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
  {
    href: profeRoutes.automatizaciones,
    label: "Automatizaciones",
    icon: "sparkles",
    shortLabel: "Autos",
  },
];

export function getSidebarNav(
  role: "profe" | "alumna",
  options?: { circunferenciasHabilitadas?: boolean | undefined },
): NavItem[] {
  const items = role === "profe" ? [...profeNav] : [...alumnaNav];

  if (role === "alumna" && options?.circunferenciasHabilitadas) {
    items.push(alumnaCircunferenciasNavItem);
  }

  items.push(ajustesNavItem);
  return items;
}
