export { connectDB, getSharedDb, getSharedMongoClient, isDbConnected, normalizeMongoUri } from "./connection";

export { Usuario, type UsuarioDocument } from "./models/usuario.model";
export { Ejercicio, type EjercicioDocument } from "./models/ejercicio.model";
export { Tutorial, type TutorialDocument } from "./models/tutorial.model";
export { Reunion, type ReunionDocument } from "./models/reunion.model";
export {
  PlanTemplate,
  type PlanTemplateDocument,
} from "./models/plan-template.model";
export { Rutina, type RutinaDocument } from "./models/rutina.model";
export { LogPeso, type LogPesoDocument } from "./models/log-peso.model";
export {
  RutinaProgreso,
  type RutinaProgresoDocument,
} from "./models/rutina-progreso.model";
export { Medicion, type MedicionDocument } from "./models/medicion.model";
export {
  EvaluacionNutricional,
  type EvaluacionNutricionalDocument,
} from "./models/evaluacion-nutricional.model";
export {
  PlanNutricional,
  type PlanNutricionalDocument,
} from "./models/plan-nutricional.model";
export {
  LandingPlan,
  type LandingPlanDocument,
} from "./models/landing-plan.model";
export {
  SiteContent,
  type SiteContentDocument,
} from "./models/site-content.model";
export {
  ChatbotLead,
  type ChatbotLeadDocument,
} from "./models/chatbot-lead.model";
export { Alimento, type AlimentoDocument } from "./models/alimento.model";
export {
  ConversacionAsistente,
  type ConversacionAsistenteDocument,
} from "./models/conversacion-asistente.model";
export {
  CoachInsight,
  type CoachInsightDocument,
} from "./models/coach-insight.model";
export {
  CheckinAlimentacion,
  type CheckinAlimentacionDocument,
} from "./models/checkin-alimentacion.model";
export {
  GamificacionEvento,
  type GamificacionEventoDocument,
} from "./models/gamificacion-evento.model";
export {
  MensajeCoach,
  type MensajeCoachDocument,
} from "./models/mensaje-coach.model";
export {
  AutomationRun,
  type AutomationRunDocument,
} from "./models/automation-run.model";
export {
  ResumenSemanal,
  type ResumenSemanalDocument,
} from "./models/resumen-semanal.model";

export {
  estadoAdmisionSchema,
  membresiaEstadoSchema,
  mensajeAutorRolSchema,
  metodoCalculoSchema,
  metodoComprobanteSchema,
  objectIdSchema,
  rolSchema,
  sexoSchema,
} from "./schemas/shared";

export {
  calculateAgeYears,
  calculateJacksonPollock3,
  calculateJacksonPollock7,
  calculateUsNavy,
  calculateImc,
  getImcCategoria,
  calculateMasaMagra,
  densidadCorporal,
  densidadCorporalJP3,
  densidadCorporalJP7,
  porcentajeGrasaSiri,
  resolveMetodoCalculo,
  sumaPlieguesJP3,
  sumaPlieguesJP7,
  validateCircunferenciasUsNavy,
  validatePlieguesForSexo,
  validatePlieguesJP3,
  validatePlieguesJP7,
  type Circunferencias,
  type MetodoCalculo,
  type PlieguesHombre,
  type PlieguesJP3,
  type PlieguesJP7,
  type PlieguesMujer,
  type Sexo,
} from "./utils/body-fat";

export {
  createUsuarioSchema,
  updateUsuarioSchema,
  healthChangesRequestSchema,
  approveHealthChangesSchema,
  type CreateUsuarioInput,
  type UpdateUsuarioInput,
  type HealthChangesRequestInput,
  type ApproveHealthChangesInput,
} from "./schemas/usuario.schema";

export {
  completarOnboardingSchema,
  updateNotificacionesSchema,
  type CompletarOnboardingInput,
  type UpdateNotificacionesInput,
} from "./schemas/me.schema";

export {
  createEjercicioSchema,
  updateEjercicioSchema,
  type CreateEjercicioInput,
  type UpdateEjercicioInput,
} from "./schemas/ejercicio.schema";

export {
  createTutorialSchema,
  updateTutorialSchema,
  reorderTutorialesSchema,
  type CreateTutorialInput,
  type UpdateTutorialInput,
  type ReorderTutorialesInput,
} from "./schemas/tutorial.schema";

export {
  createReunionSchema,
  updateReunionSchema,
  listReunionesQuerySchema,
  type CreateReunionInput,
  type UpdateReunionInput,
  type ListReunionesQuery,
} from "./schemas/reunion.schema";

export {
  createRutinaSchema,
  updateRutinaSchema,
  duplicarSemanaSchema,
  type CreateRutinaInput,
  type UpdateRutinaInput,
  type DuplicarSemanaInput,
} from "./schemas/rutina.schema";

export {
  createPlanTemplateSchema,
  updatePlanTemplateSchema,
  type CreatePlanTemplateInput,
  type UpdatePlanTemplateInput,
} from "./schemas/plan-template.schema";

export {
  planTemplateBlueprintSchema,
  type PlanTemplateBlueprint,
} from "./schemas/rutina-blueprint.schema";

export {
  createLogPesoSchema,
  upsertLogPesoSchema,
  type CreateLogPesoInput,
  type UpsertLogPesoInput,
} from "./schemas/log-peso.schema";

export {
  createMedicionSchema,
  type CreateMedicionInput,
} from "./schemas/medicion.schema";

export {
  createEvaluacionNutricionalSchema,
  objetivoNutricionalSchema,
  preferenciaAlimentariaSchema,
  restriccionAlimentariaSchema,
  nivelActividadSchema,
  ocupacionSchema,
  presupuestoAproximadoSchema,
  type CreateEvaluacionNutricionalInput,
} from "./schemas/evaluacion-nutricional.schema";

export {
  createPlanNutricionalSchema,
  updatePlanNutricionalSchema,
  generarBorradorPlanSchema,
  nutricionChatSchema,
  planNutricionalEstadoSchema,
  macrosObjetivoSchema,
  comidaPlanSchema,
  diaPlanNutricionalSchema,
  ingredientePlanSchema,
  type CreatePlanNutricionalInput,
  type UpdatePlanNutricionalInput,
  type GenerarBorradorPlanInput,
  type NutricionChatInput,
  type MacrosObjetivo,
  type ComidaPlan,
  type DiaPlanNutricional,
  type IngredientePlan,
  type PlanNutricionalEstado,
} from "./schemas/plan-nutricional.schema";

export {
  calculateBmrMifflin,
  calculateTdee,
  calculateMacrosFromKcal,
  calculateMacrosObjetivo,
} from "./utils/tdee";

export {
  upsertRutinaProgresoSchema,
  type UpsertRutinaProgresoInput,
} from "./schemas/rutina-progreso.schema";

export {
  createLandingPlanSchema,
  updateLandingPlanSchema,
  type CreateLandingPlanInput,
  type UpdateLandingPlanInput,
} from "./schemas/landing-plan.schema";

export {
  chatbotStepSchema,
  chatbotAnswersSchema,
  chatbotTurnSchema,
  upsertChatbotLeadSchema,
  listChatbotLeadsQuerySchema,
  chatbotLeadStatusSchema,
  setChatbotLeadContactadaSchema,
  type ChatbotStep,
  type ChatbotAnswers,
  type ChatbotTurnInput,
  type UpsertChatbotLeadInput,
  type ListChatbotLeadsQuery,
  type SetChatbotLeadContactadaInput,
} from "./schemas/chatbot-lead.schema";

export {
  alimentoCategoriaSchema,
  alimentoUnidadSchema,
  createAlimentoSchema,
  updateAlimentoSchema,
  listAlimentosQuerySchema,
  type AlimentoCategoria,
  type AlimentoUnidad,
  type CreateAlimentoInput,
  type UpdateAlimentoInput,
  type ListAlimentosQuery,
} from "./schemas/alimento.schema";

export {
  asistenteChatSchema,
  asistenteCheckinSchema,
  asistenteCheckinRatingSchema,
  asistenteCheckinMotivoSchema,
  type AsistenteChatInput,
  type AsistenteCheckinInput,
  type AsistenteCheckinRating,
  type AsistenteCheckinMotivo,
} from "./schemas/asistente.schema";

export {
  checkinAlimentacionEstadoSchema,
  upsertCheckinAlimentacionSchema,
  type CheckinAlimentacionEstado,
  type UpsertCheckinAlimentacionInput,
} from "./schemas/checkin-alimentacion.schema";

export {
  createMensajeCoachSchema,
  type CreateMensajeCoachInput,
} from "./schemas/mensaje-coach.schema";

export {
  createCoachNotaSchema,
  type CreateCoachNotaInput,
} from "./schemas/coach-insight.schema";
