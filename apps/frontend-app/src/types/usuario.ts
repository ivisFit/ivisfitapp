export type AdmissionStatus = "pendiente" | "admitida" | "rechazada";

export type Sexo = "hombre" | "mujer";

export type MembresiaEstado = "al_dia" | "por_vencer" | "vencida";

export type MetodoComprobante = "adjunto" | "whatsapp";

export type ComprobantePago = {
  url: string;
  publicId: string;
  nombreArchivo?: string;
  formato?: string;
  bytes?: number;
  uploadedAt?: string;
};

export type FotoPerfil = {
  url: string;
  publicId: string;
  uploadedAt?: string;
};

export type NotificacionesApiDoc = {
  pushHabilitado?: boolean;
  recordatoriosEntrenamiento?: boolean;
  horaEntrenamiento?: string | null;
  notificarLogros?: boolean;
  notificarCheckins?: boolean;
};

export type GamificacionApiDoc = {
  xpTotal?: number;
  nivel?: number;
  rachaActual?: number;
  rachaMaxima?: number;
  xpProgresoNivel?: number;
  xpSiguiente?: number;
  badges?: Array<{
    codigo: string;
    desbloqueadoAt?: string;
    desbloqueado?: boolean;
    icono?: string;
  }>;
};

export type HealthChangePending = {
  proposed: string;
  current?: string;
  requestedAt: string;
};

export type HealthChangesPendingApiDoc = {
  mutualista?: HealthChangePending;
  coberturaEmergenciaMedica?: HealthChangePending;
  lesionesPatologias?: HealthChangePending;
  alergias?: HealthChangePending;
};

export type HealthChangesRequestInput = {
  mutualista?: string;
  coberturaEmergenciaMedica?: string;
  lesionesPatologias?: string;
  alergias?: string;
};

export type ApproveHealthChangesInput = {
  fields: Array<
    | "mutualista"
    | "coberturaEmergenciaMedica"
    | "lesionesPatologias"
    | "alergias"
  >;
};

export type AlumnaListItem = {
  id: string;
  nombre: string;
  email: string;
  photoUrl?: string;
  membresia?: {
    estado?: MembresiaEstado;
    fechaVencimiento?: string | null;
  };
  tieneRutina?: boolean;
  tieneEvaluacionNutricional?: boolean;
  tienePlanNutricional?: boolean;
};

export type AlumnaDetail = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  mutualista?: string;
  sexo?: Sexo;
  alturaCm?: number;
  fechaNacimiento?: string;
  coberturaEmergenciaMedica?: string;
  lesionesPatologias?: string;
  alergias?: string;
  cedula?: string;
  fechaRegistro?: string;
  rol: string;
  estadoAdmision: AdmissionStatus;
  metodoComprobante?: MetodoComprobante;
  comprobantePago?: ComprobantePago;
  fotoPerfil?: FotoPerfil;
  fechaAdmision?: string;
  fechaRechazo?: string;
  circunferenciasHabilitadas?: boolean;
  healthChangesPending?: HealthChangesPendingApiDoc;
  gamificacion?: GamificacionApiDoc;
  notificaciones?: NotificacionesApiDoc;
  membresia?: {
    estado?: MembresiaEstado;
    fechaVencimiento?: string | null;
  };
};

export type UsuarioApiDoc = {
  _id?: string;
  id?: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: string;
  mutualista?: string;
  sexo?: Sexo;
  alturaCm?: number;
  fechaNacimiento?: string;
  coberturaEmergenciaMedica?: string;
  lesionesPatologias?: string;
  alergias?: string;
  cedula?: string;
  estadoAdmision?: AdmissionStatus;
  metodoComprobante?: MetodoComprobante;
  comprobantePago?: ComprobantePago;
  fotoPerfil?: FotoPerfil;
  fechaAdmision?: string;
  fechaRechazo?: string;
  fechaRegistro?: string;
  createdAt?: string;
  circunferenciasHabilitadas?: boolean;
  tutorialesVistos?: boolean;
  onboardingCompletado?: boolean;
  notificaciones?: NotificacionesApiDoc;
  gamificacion?: GamificacionApiDoc;
  healthChangesPending?: HealthChangesPendingApiDoc;
  membresia?: {
    estado?: MembresiaEstado;
    fechaVencimiento?: string | null;
  };
  tieneRutina?: boolean;
  tieneEvaluacionNutricional?: boolean;
  tienePlanNutricional?: boolean;
};

function formatFechaRegistro(fecha?: string) {
  if (!fecha) return undefined;
  return new Date(fecha).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function mapUsuarioFromApi(doc: UsuarioApiDoc): AlumnaListItem {
  return {
    id: doc._id ?? doc.id ?? "",
    nombre: doc.nombre,
    email: doc.correo,
    photoUrl: doc.fotoPerfil?.url,
    membresia: doc.membresia
      ? {
          estado: doc.membresia.estado,
          fechaVencimiento: doc.membresia.fechaVencimiento
            ? String(doc.membresia.fechaVencimiento)
            : null,
        }
      : undefined,
    tieneRutina: doc.tieneRutina === true,
    tieneEvaluacionNutricional: doc.tieneEvaluacionNutricional === true,
    tienePlanNutricional: doc.tienePlanNutricional === true,
  };
}

export function mapUsuarioDetailFromApi(doc: UsuarioApiDoc): AlumnaDetail {
  return {
    id: doc._id ?? doc.id ?? "",
    nombre: doc.nombre,
    email: doc.correo,
    telefono: doc.telefono,
    mutualista: doc.mutualista || undefined,
    sexo:
      doc.sexo === "hombre" || doc.sexo === "mujer" ? doc.sexo : undefined,
    alturaCm:
      typeof doc.alturaCm === "number" && doc.alturaCm > 0
        ? doc.alturaCm
        : undefined,
    fechaNacimiento: formatFechaRegistro(doc.fechaNacimiento),
    coberturaEmergenciaMedica: doc.coberturaEmergenciaMedica || undefined,
    lesionesPatologias: doc.lesionesPatologias || undefined,
    alergias: doc.alergias || undefined,
    cedula: doc.cedula || undefined,
    fechaRegistro: formatFechaRegistro(doc.fechaRegistro ?? doc.createdAt),
    rol: doc.rol,
    estadoAdmision: doc.estadoAdmision ?? "admitida",
    metodoComprobante: doc.metodoComprobante,
    comprobantePago: doc.comprobantePago,
    fotoPerfil: doc.fotoPerfil,
    fechaAdmision: formatFechaRegistro(doc.fechaAdmision),
    fechaRechazo: formatFechaRegistro(doc.fechaRechazo),
    circunferenciasHabilitadas: doc.circunferenciasHabilitadas === true,
    healthChangesPending: doc.healthChangesPending,
    gamificacion: doc.gamificacion,
    notificaciones: doc.notificaciones,
    membresia: doc.membresia
      ? {
          estado: doc.membresia.estado,
          fechaVencimiento: doc.membresia.fechaVencimiento
            ? String(doc.membresia.fechaVencimiento)
            : null,
        }
      : undefined,
  };
}

export type AdmissionRequest = AlumnaDetail & {
  metodoComprobante?: MetodoComprobante;
  comprobantePago?: ComprobantePago;
  fechaSolicitud?: string;
};

export function mapAdmissionRequestFromApi(doc: UsuarioApiDoc): AdmissionRequest {
  return {
    ...mapUsuarioDetailFromApi(doc),
    metodoComprobante: doc.metodoComprobante,
    comprobantePago: doc.comprobantePago,
    fechaSolicitud: formatFechaRegistro(doc.createdAt ?? doc.fechaRegistro),
  };
}
