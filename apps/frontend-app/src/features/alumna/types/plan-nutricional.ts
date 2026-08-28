export type MacrosObjetivo = {
  kcal: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
};

export type IngredientePlanUnidad = "g" | "ml" | "unidad";

export type IngredientePlan = {
  alimentoId?: string;
  nombre: string;
  cantidad: number;
  unidad: IngredientePlanUnidad;
  kcal?: number;
  proteinaG?: number;
  carbohidratosG?: number;
  grasasG?: number;
};

export type ComidaPlan = {
  nombre: string;
  horario?: string;
  ingredientes: IngredientePlan[];
  notas?: string;
  preparacion?: string;
  macrosComida?: MacrosObjetivo;
};

export type DiaPlanNutricional = {
  nombre: string;
  comidas: ComidaPlan[];
};

export type PlanNutricionalEstado = "borrador" | "publicado" | "archivado";

export type PlanNutricionalApiDoc = {
  _id?: string;
  id?: string;
  alumnaId: string;
  evaluacionId?: string;
  titulo: string;
  estado: PlanNutricionalEstado;
  observacionesProfe?: string;
  macrosObjetivo: MacrosObjetivo;
  dias: DiaPlanNutricional[];
  generadoPorIa?: boolean;
  publicadoAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePlanNutricionalPayload = {
  alumnaId: string;
  evaluacionId?: string;
  titulo?: string;
  observacionesProfe?: string;
  macrosObjetivo: MacrosObjetivo;
  dias: DiaPlanNutricional[];
  generadoPorIa?: boolean;
};

export type UpdatePlanNutricionalPayload = Partial<
  Omit<CreatePlanNutricionalPayload, "alumnaId">
>;

export type GestionAlimentacionItem = {
  alumnaId: string;
  alumnaNombre: string;
  alumnaEmail: string;
  evaluacionId: string;
  evaluacionCompletada: boolean;
  evaluacionCreatedAt?: string;
  planId?: string;
  planEstado?: PlanNutricionalEstado;
  planTitulo?: string;
  publicadoAt?: string;
};

export type ComposicionCorporal = {
  pesoKg?: number;
  imc?: number;
  porcentajeGrasaCorporal?: number;
  masaMagra?: number;
  fechaMedicion?: string;
};

export type EvaluacionBriefingResponse = {
  briefing: string;
  macrosSugeridos: MacrosObjetivo;
  composicionCorporal?: ComposicionCorporal;
};

export type NutricionChatResponse = {
  reply: string;
};
