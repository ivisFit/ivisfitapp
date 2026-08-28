export type PanelActivityTipo =
  | "rutina_completada"
  | "admision"
  | "registro_peso";

export type PanelActivityItem = {
  id: string;
  tipo: PanelActivityTipo;
  titulo: string;
  ocurrioEn: string;
};

export type PanelAppointmentItem = {
  id: string;
  titulo: string;
  fechaHora: string;
};

export type PanelWeeklyPoint = {
  dia: string;
  completados: number;
};

export type PanelTrendPoint = {
  dia: string;
  completados: number;
};

export type PanelPlanDistribution = {
  nombre: string;
  cantidad: number;
  porcentaje: number;
};

export type PanelAlumnaAtencionItem = {
  id: string;
  nombre: string;
  adherencia: number;
};

export type PanelDashboardDto = {
  metricas: {
    alumnasActivas: number;
    entrenamientosPlanificados: number;
    ingresosMes: { monto: number; moneda: string };
    satisfaccionPromedio: number;
  };
  tendencias: {
    alumnasNuevas: number;
    alumnasNuevasDelta: number | null;
    ingresosDelta: number | null;
    entrenamientosDelta: number | null;
  };
  actividadReciente: PanelActivityItem[];
  proximasCitas: PanelAppointmentItem[];
  progresoSemanal: PanelWeeklyPoint[];
  progreso30d: PanelTrendPoint[];
  distribucionPlanes: PanelPlanDistribution[];
  alumnasAtencion: PanelAlumnaAtencionItem[];
  cola?: {
    counts: {
      admisionesPendientes: number;
      sinRutina: number;
      evalSinPlan: number;
      checkinsAtencion: number;
      adherenciaBaja: number;
      membresiasPorVencer: number;
      membresiasVencidas: number;
    };
  };
};
