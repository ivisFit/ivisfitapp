import type { UserRole } from "@/types/auth";

export const publicRoutes = {
  login: "/login",
  registro: "/registro",
  solicitudPendiente: "/solicitud-pendiente",
  recuperar: "/login/recuperar",
  restablecer: "/login/restablecer",
} as const;

export const sharedRoutes = {
  ajustes: "/ajustes",
} as const;

export function getHomeRouteForRole(role: UserRole): string {
  return role === "profe" ? profeRoutes.panel : alumnaRoutes.rutina;
}

export const alumnaRoutes = {
  home: "/rutina",
  rutina: "/rutina",
  alimentacion: "/alimentacion",
  evaluacionNutricional: "/evaluacion-nutricional",
  progreso: "/progreso",
  progresoImprimir: "/progreso/imprimir",
  circunferencias: "/circunferencias",
  asistente: "/asistente",
  tutoriales: "/tutoriales",
  logros: "/logros",
  bienvenida: "/bienvenida",
  reunion: "/reunion",
  miPerfil: "/mi-perfil",
  mensajes: "/mensajes",
  biblioteca: "/biblioteca",
} as const;

export const MENSAJES_BORRADOR_PARAM = "borrador";

export function alumnaMensajesRoute(borrador?: string) {
  if (!borrador?.trim()) return alumnaRoutes.mensajes;
  return `${alumnaRoutes.mensajes}?${MENSAJES_BORRADOR_PARAM}=${encodeURIComponent(borrador)}`;
}

export const profeRoutes = {
  panel: "/panel",
  admisiones: "/admisiones",
  catalogo: "/catalogo",
  ejercicios: "/ejercicios",
  gestionAlimentos: "/gestion-alimentos",
  alumnas: "/alumnas",
  nuevaRutina: "/rutinas",
  webConfig: "/web-config",
  agenda: "/agenda",
  leadsChatbot: "/leads-chatbot",
  animaciones: "/animaciones",
  automatizaciones: "/automatizaciones",
} as const;

export function profeAlumnasAdmisionesRoute() {
  return `${profeRoutes.alumnas}?tab=admisiones`;
}

export type AlumnasListaFiltro =
  | "sin_rutina"
  | "eval_sin_plan"
  | "checkins_hoy"
  | "adherencia_baja"
  | "por_vencer"
  | "vencida"
  | "membresias";

export function profeAlumnasFiltroRoute(filtro: AlumnasListaFiltro) {
  return `${profeRoutes.alumnas}?filtro=${filtro}`;
}

export function profeCatalogoAlimentosRoute() {
  return `${profeRoutes.catalogo}?tab=alimentos`;
}

export function profeCatalogoTutorialesRoute() {
  return `${profeRoutes.catalogo}?tab=tutoriales`;
}

export function profeCatalogoAgendaRoute() {
  return profeRoutes.agenda;
}

export function profeWebChatbotRoute() {
  return `${profeRoutes.webConfig}?tab=chatbot`;
}

export function profeAlumnaDetailRoute(id: string) {
  return `/alumnas/${id}`;
}

export type AlumnaDetailTab =
  | "perfil"
  | "rutina"
  | "historial"
  | "seguimiento"
  | "alimentacion"
  | "pliegues"
  | "mensajes";

export function profeAlumnaDetailTabRoute(
  id: string,
  tab: AlumnaDetailTab = "perfil",
) {
  if (tab === "perfil") return profeAlumnaDetailRoute(id);
  return `${profeAlumnaDetailRoute(id)}?tab=${tab}`;
}

export function profeAlumnaSeguimientoRoute(id: string) {
  return profeAlumnaDetailTabRoute(id, "seguimiento");
}

export function profeAlumnaPlieguesRoute(id: string) {
  return profeAlumnaDetailTabRoute(id, "pliegues");
}

export function profeAlumnaAlimentacionRoute(id: string) {
  return profeAlumnaDetailTabRoute(id, "alimentacion");
}

export function isAlumnaDetailPath(pathname: string) {
  return /^\/alumnas\/[^/]+(\/(seguimiento|pliegues|alimentacion))?$/.test(pathname);
}

export function isAsistentePath(pathname: string) {
  return (
    pathname === alumnaRoutes.asistente ||
    pathname.startsWith(`${alumnaRoutes.asistente}/`)
  );
}

export function isSameAlumnaDetailPath(pathname: string, alumnaId: string) {
  return pathname === `/alumnas/${alumnaId}`;
}

export function getAlumnaDetailTabFromParam(
  tab: string | null,
): AlumnaDetailTab {
  if (tab === "rutina") return "rutina";
  if (tab === "historial") return "historial";
  if (tab === "seguimiento") return "seguimiento";
  if (tab === "alimentacion") return "alimentacion";
  if (tab === "pliegues") return "pliegues";
  if (tab === "mensajes") return "mensajes";
  return "perfil";
}
