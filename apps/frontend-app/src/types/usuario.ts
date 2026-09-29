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

function parseFechaLegible(fecha: string): Date | null {
  const trimmed = fecha.trim();
  const display = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (display) {
    const [, dd, mm, yyyy] = display;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (isoDate) {
    const [, yyyy, mm, dd] = isoDate;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (/T\d/.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    );
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatFechaRegistro(fecha?: string | Date) {
  if (fecha == null || fecha === "") return undefined;
  const raw = typeof fecha === "string" ? fecha : fecha.toISOString();
  const parsed = parseFechaLegible(raw);
  if (!parsed) return typeof fecha === "string" ? fecha.trim() : undefined;
  return parsed.toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Valor para `<input type="date">` (yyyy-mm-dd). */
export function fechaToDateInputValue(fecha?: string) {
  if (!fecha?.trim()) return "";
  const parsed = parseFechaLegible(fecha);
  if (!parsed) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
    nombre: doc.nombre?.trim() || "Sin nombre",
    email: doc.correo?.trim() || "",
    telefono: doc.telefono?.trim() || "",
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
