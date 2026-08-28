import type { PanelDashboardDto } from "@/features/profe/types/panel";

export function isPanelDashboardDto(value: unknown): value is PanelDashboardDto {
  if (!value || typeof value !== "object") return false;

  const candidate = value as PanelDashboardDto;

  return (
    typeof candidate.metricas?.alumnasActivas === "number" &&
    typeof candidate.metricas?.entrenamientosPlanificados === "number" &&
    typeof candidate.metricas?.satisfaccionPromedio === "number" &&
    typeof candidate.metricas?.ingresosMes?.monto === "number" &&
    typeof candidate.tendencias?.alumnasNuevas === "number" &&
    Array.isArray(candidate.actividadReciente) &&
    Array.isArray(candidate.proximasCitas) &&
    Array.isArray(candidate.progresoSemanal) &&
    Array.isArray(candidate.progreso30d) &&
    Array.isArray(candidate.distribucionPlanes) &&
    Array.isArray(candidate.alumnasAtencion)
  );
}
