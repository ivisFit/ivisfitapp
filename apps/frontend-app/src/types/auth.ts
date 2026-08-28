import type { AdmissionStatus } from "@/types/usuario";

export type UserRole = "profe" | "alumna";

export interface NotificacionesPreferencias {
  pushHabilitado?: boolean;
  recordatoriosEntrenamiento?: boolean;
  horaEntrenamiento?: string | null;
  notificarLogros?: boolean;
  notificarCheckins?: boolean;
}

export interface GamificacionPerfil {
  xpTotal?: number;
  nivel?: number;
  rachaActual?: number;
  rachaMaxima?: number;
  badges?: Array<{ codigo: string; desbloqueadoAt?: string }>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  admissionStatus: AdmissionStatus;
  photoUrl?: string | null;
  circunferenciasHabilitadas?: boolean;
  tutorialesVistos?: boolean;
  onboardingCompletado?: boolean;
  notificaciones?: NotificacionesPreferencias;
  gamificacion?: GamificacionPerfil;
}
