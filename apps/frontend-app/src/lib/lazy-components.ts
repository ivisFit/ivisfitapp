import { lazy, type ComponentType, type LazyExoticComponent } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(factory);
}

export const heavyComponents = {
  CreadorRutinas: lazyLoad(() => import("@/features/profe/pages/CreadorRutinas").then((m) => ({ default: m.CreadorRutinas }))),
  BancoEjercicios: lazyLoad(() => import("@/features/profe/pages/BancoEjercicios").then((m) => ({ default: m.BancoEjercicios }))),
  PlanNutricionalBuilder: lazyLoad(() => import("@/features/profe/components/PlanNutricionalBuilder").then((m) => ({ default: m.PlanNutricionalBuilder }))),
  RutinaBuilder: lazyLoad(() => import("@/features/profe/components/RutinaBuilder").then((m) => ({ default: m.RutinaBuilder }))),
  DashboardProfe: lazyLoad(() => import("@/features/profe/pages/DashboardProfe").then((m) => ({ default: m.DashboardProfe }))),
  AnimacionesPage: lazyLoad(() => import("@/features/profe/pages/AnimacionesPage").then((m) => ({ default: m.AnimacionesPage }))),
  GestorAlumnas: lazyLoad(() => import("@/features/profe/pages/GestorAlumnas").then((m) => ({ default: m.GestorAlumnas }))),
  PlanesLandingAdmin: lazyLoad(() => import("@/features/profe/pages/PlanesLandingAdmin").then((m) => ({ default: m.PlanesLandingAdmin }))),
  GestionPlanesLanding: lazyLoad(() => import("@/features/profe/pages/GestionPlanesLanding").then((m) => ({ default: m.GestionPlanesLanding }))),
  GestionAlimentos: lazyLoad(() => import("@/features/profe/pages/GestionAlimentos").then((m) => ({ default: m.GestionAlimentos }))),
  LeadsChatbotPage: lazyLoad(() => import("@/features/profe/pages/LeadsChatbotPage").then((m) => ({ default: m.LeadsChatbotPage }))),
  AlumnaSeguimientoPage: lazyLoad(() => import("@/features/profe/pages/AlumnaSeguimientoPage").then((m) => ({ default: m.AlumnaSeguimientoPage }))),
  AlumnaPlieguesPage: lazyLoad(() => import("@/features/profe/pages/AlumnaPlieguesPage").then((m) => ({ default: m.AlumnaPlieguesPage }))),
  AlumnaDetailPage: lazyLoad(() => import("@/features/profe/pages/AlumnaDetailPage").then((m) => ({ default: m.AlumnaDetailPage }))),
  PlanTemplateDetailPage: lazyLoad(() => import("@/features/profe/pages/PlanTemplateDetailPage").then((m) => ({ default: m.PlanTemplateDetailPage }))),
  AlumnaAlimentacionPage: lazyLoad(() => import("@/features/profe/pages/AlumnaAlimentacionPage").then((m) => ({ default: m.AlumnaAlimentacionPage }))),
};