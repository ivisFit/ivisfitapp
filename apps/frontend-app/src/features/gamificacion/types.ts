export interface GamificacionBadge {
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueado: boolean;
  desbloqueadoAt?: string | null;
}

export interface GamificacionEvento {
  _id: string;
  tipo: string;
  puntos: number;
  descripcion: string;
  createdAt: string;
}

export interface GamificacionPerfil {
  xpTotal: number;
  nivel: number;
  xpProgresoNivel: number;
  xpSiguiente: number;
  rachaActual: number;
  rachaMaxima: number;
  badges: GamificacionBadge[];
  proximosLogros: GamificacionBadge[];
  eventosRecientes: GamificacionEvento[];
}

export function xpProgresoPorcentaje(perfil: GamificacionPerfil): number {
  if (perfil.xpSiguiente <= 0) return 0;
  const progreso = (perfil.xpProgresoNivel / perfil.xpSiguiente) * 100;
  return Math.min(100, Math.max(0, Math.round(progreso)));
}
