export type CoachInsightTipo =
  | "dias_sin_entrenar"
  | "cumplimiento_bajo"
  | "peso_estancado"
  | "medicion_pendiente"
  | "racha_positiva"
  | "nuevo_record"
  | "alimentacion_baja"
  | "sin_plan_alimentacion"
  | "desafio_semanal"
  | "nota_coach"
  | "plan_publicado"
  | "rutina_asignada";

export type CoachPerfilTono =
  | "motivacion"
  | "organizacion"
  | "recordatorio"
  | "celebracion";

export type CoachInsight = {
  _id: string;
  tipo: CoachInsightTipo;
  mensaje: string;
  prioridad: number;
  leido: boolean;
  accionSugerida?: string;
  perfil?: CoachPerfilTono;
  createdAt: string;
};
