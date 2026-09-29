import type { BadgeCodigo } from "./gamificacion-badges.catalog.js";

export interface BadgeContext {
  totalDias: number;
  rachaMaxima: number;
  totalCheckins: number;
  totalCheckinsValidos: number;
  totalCheckinsCumpli: number;
  rachaAlimentacionMaxima: number;
  totalMediciones: number;
  totalMedicionesPliegues: number;
  totalMedicionesCircunferencias: number;
  totalLogsPesos: number;
  ejerciciosConPesoDistintos: number;
  nivel: number;
  tieneEvaluacion: boolean;
  tieneFotoPerfil: boolean;
  onboardingCompletado: boolean;
  mensajesAsistenteUsuario: number;
  tieneCheckinAsistente: boolean;
  tieneDiaCompleto: boolean;
  tieneSemanaEquilibrada: boolean;
}

export function badgeCumplido(codigo: BadgeCodigo, ctx: BadgeContext): boolean {
  switch (codigo) {
    case "primer_entrenamiento":
      return ctx.totalDias >= 1;
    case "entrenamientos_5":
      return ctx.totalDias >= 5;
    case "entrenamientos_10":
      return ctx.totalDias >= 10;
    case "entrenamientos_25":
      return ctx.totalDias >= 25;
    case "entrenamientos_50":
      return ctx.totalDias >= 50;
    case "entrenamientos_75":
      return ctx.totalDias >= 75;
    case "entrenamientos_100":
      return ctx.totalDias >= 100;
    case "racha_3":
      return ctx.rachaMaxima >= 3;
    case "racha_7":
      return ctx.rachaMaxima >= 7;
    case "racha_14":
      return ctx.rachaMaxima >= 14;
    case "racha_21":
      return ctx.rachaMaxima >= 21;
    case "racha_28":
      return ctx.rachaMaxima >= 28;
    case "desafio_completado":
      return ctx.totalDias >= 28;
    case "primer_checkin":
      return ctx.totalCheckins >= 1;
    case "checkin_semana":
      return ctx.totalCheckins >= 7;
    case "checkin_14":
      return ctx.totalCheckins >= 14;
    case "checkin_30":
      return ctx.totalCheckins >= 30;
    case "checkin_60":
      return ctx.totalCheckins >= 60;
    case "checkins_cumpli_10":
      return ctx.totalCheckinsCumpli >= 10;
    case "racha_alim_3":
      return ctx.rachaAlimentacionMaxima >= 3;
    case "racha_alim_7":
      return ctx.rachaAlimentacionMaxima >= 7;
    case "racha_alim_14":
      return ctx.rachaAlimentacionMaxima >= 14;
    case "primera_medicion":
      return ctx.totalMediciones >= 1;
    case "mediciones_3":
      return ctx.totalMediciones >= 3;
    case "mediciones_5":
      return ctx.totalMediciones >= 5;
    case "mediciones_10":
      return ctx.totalMediciones >= 10;
    case "pliegues_registrados":
      return ctx.totalMedicionesPliegues >= 1;
    case "circunferencias_registradas":
      return ctx.totalMedicionesCircunferencias >= 1;
    case "peso_logueado":
      return ctx.totalLogsPesos >= 1;
    case "pesos_10":
      return ctx.totalLogsPesos >= 10;
    case "pesos_25":
      return ctx.totalLogsPesos >= 25;
    case "pesos_50":
      return ctx.totalLogsPesos >= 50;
    case "ejercicios_5_distintos":
      return ctx.ejerciciosConPesoDistintos >= 5;
    case "nivel_3":
      return ctx.nivel >= 3;
    case "nivel_5":
      return ctx.nivel >= 5;
    case "nivel_7":
      return ctx.nivel >= 7;
    case "nivel_10":
      return ctx.nivel >= 10;
    case "nivel_15":
      return ctx.nivel >= 15;
    case "nivel_20":
      return ctx.nivel >= 20;
    case "nivel_25":
      return ctx.nivel >= 25;
    case "evaluacion_completada":
      return ctx.tieneEvaluacion;
    case "foto_perfil":
      return ctx.tieneFotoPerfil;
    case "onboarding_completado":
      return ctx.onboardingCompletado;
    case "asistente_primer_mensaje":
      return ctx.mensajesAsistenteUsuario >= 1;
    case "asistente_10_mensajes":
      return ctx.mensajesAsistenteUsuario >= 10;
    case "asistente_checkin":
      return ctx.tieneCheckinAsistente;
    case "dia_completo":
      return ctx.tieneDiaCompleto;
    case "semana_equilibrada":
      return ctx.tieneSemanaEquilibrada;
    default:
      return false;
  }
}

export function progresoBadge(
  codigo: BadgeCodigo,
  ctx: BadgeContext,
): { actual: number; objetivo: number } | null {
  const num = (actual: number, objetivo: number) => ({ actual, objetivo });

  switch (codigo) {
    case "primer_entrenamiento":
      return num(ctx.totalDias, 1);
    case "entrenamientos_5":
      return num(ctx.totalDias, 5);
    case "entrenamientos_10":
      return num(ctx.totalDias, 10);
    case "entrenamientos_25":
      return num(ctx.totalDias, 25);
    case "entrenamientos_50":
      return num(ctx.totalDias, 50);
    case "entrenamientos_75":
      return num(ctx.totalDias, 75);
    case "entrenamientos_100":
      return num(ctx.totalDias, 100);
    case "racha_3":
      return num(ctx.rachaMaxima, 3);
    case "racha_7":
      return num(ctx.rachaMaxima, 7);
    case "racha_14":
      return num(ctx.rachaMaxima, 14);
    case "racha_21":
      return num(ctx.rachaMaxima, 21);
    case "racha_28":
      return num(ctx.rachaMaxima, 28);
    case "desafio_completado":
      return num(ctx.totalDias, 28);
    case "primer_checkin":
      return num(ctx.totalCheckins, 1);
    case "checkin_semana":
      return num(ctx.totalCheckins, 7);
    case "checkin_14":
      return num(ctx.totalCheckins, 14);
    case "checkin_30":
      return num(ctx.totalCheckins, 30);
    case "checkin_60":
      return num(ctx.totalCheckins, 60);
    case "checkins_cumpli_10":
      return num(ctx.totalCheckinsCumpli, 10);
    case "racha_alim_3":
      return num(ctx.rachaAlimentacionMaxima, 3);
    case "racha_alim_7":
      return num(ctx.rachaAlimentacionMaxima, 7);
    case "racha_alim_14":
      return num(ctx.rachaAlimentacionMaxima, 14);
    case "primera_medicion":
      return num(ctx.totalMediciones, 1);
    case "mediciones_3":
      return num(ctx.totalMediciones, 3);
    case "mediciones_5":
      return num(ctx.totalMediciones, 5);
    case "mediciones_10":
      return num(ctx.totalMediciones, 10);
    case "pliegues_registrados":
      return num(ctx.totalMedicionesPliegues, 1);
    case "circunferencias_registradas":
      return num(ctx.totalMedicionesCircunferencias, 1);
    case "peso_logueado":
      return num(ctx.totalLogsPesos, 1);
    case "pesos_10":
      return num(ctx.totalLogsPesos, 10);
    case "pesos_25":
      return num(ctx.totalLogsPesos, 25);
    case "pesos_50":
      return num(ctx.totalLogsPesos, 50);
    case "ejercicios_5_distintos":
      return num(ctx.ejerciciosConPesoDistintos, 5);
    case "nivel_3":
      return num(ctx.nivel, 3);
    case "nivel_5":
      return num(ctx.nivel, 5);
    case "nivel_7":
      return num(ctx.nivel, 7);
    case "nivel_10":
      return num(ctx.nivel, 10);
    case "nivel_15":
      return num(ctx.nivel, 15);
    case "nivel_20":
      return num(ctx.nivel, 20);
    case "nivel_25":
      return num(ctx.nivel, 25);
    case "asistente_primer_mensaje":
      return num(ctx.mensajesAsistenteUsuario, 1);
    case "asistente_10_mensajes":
      return num(ctx.mensajesAsistenteUsuario, 10);
    default:
      return null;
  }
}

/** ISO week key YYYY-Www from YYYY-MM-DD (UTC). */
export function isoWeekKey(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function tieneSemanaEquilibrada(
  entrenamientoDateKeys: string[],
  checkinValidosDateKeys: string[],
): boolean {
  const entrenosPorSemana = new Map<string, Set<string>>();
  for (const key of entrenamientoDateKeys) {
    const week = isoWeekKey(key);
    if (!entrenosPorSemana.has(week)) entrenosPorSemana.set(week, new Set());
    entrenosPorSemana.get(week)!.add(key);
  }
  const checkinsPorSemana = new Map<string, Set<string>>();
  for (const key of checkinValidosDateKeys) {
    const week = isoWeekKey(key);
    if (!checkinsPorSemana.has(week)) checkinsPorSemana.set(week, new Set());
    checkinsPorSemana.get(week)!.add(key);
  }
  for (const [week, entrenos] of entrenosPorSemana) {
    const checkins = checkinsPorSemana.get(week);
    if (checkins && entrenos.size >= 3 && checkins.size >= 3) {
      return true;
    }
  }
  return false;
}

export function tieneDiaCompleto(
  entrenamientoDateKeys: string[],
  checkinValidosDateKeys: string[],
): boolean {
  const checkins = new Set(checkinValidosDateKeys);
  return entrenamientoDateKeys.some((key) => checkins.has(key));
}
