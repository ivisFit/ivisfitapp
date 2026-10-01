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

export type EstructuraComida = {
  nombre: string;
  horario?: string;
  porcentajeKcal: number;
};

export type ComidaPlan = {
  nombre: string;
  horario?: string;
  ingredientes: IngredientePlan[];
  notas?: string;
  preparacion?: string;
  macrosObjetivo?: MacrosObjetivo;
  macrosComida?: MacrosObjetivo;
};

export type DiaPlanNutricional = {
  nombre: string;
  comidas: ComidaPlan[];
};

export type ListaComprasItem = {
  nombre: string;
  cantidades: string[];
};

export type ListaComprasSemana = {
  numeroSemana: number;
  items: ListaComprasItem[];
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
  estructuraComidas?: EstructuraComida[];
  dias: DiaPlanNutricional[];
  listasComprasSemanas?: ListaComprasSemana[];
  generadoPorIa?: boolean;
  publicadoAt?: string;
  clonadoDesdeId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PlanNutricionalProfeWorkspace = {
  editing: PlanNutricionalApiDoc | null;
  borrador: PlanNutricionalApiDoc | null;
  publicado: PlanNutricionalApiDoc | null;
};

export type PlanValidacionItem = {
  id: string;
  nivel: "error" | "warning";
  mensaje: string;
};

export type PlanValidacionResponse = {
  items: PlanValidacionItem[];
  puedePublicar: boolean;
};

export type PlanReutilizableItem = {
  id: string;
  alumnaId: string;
  alumnaNombre: string;
  titulo: string;
  estado: PlanNutricionalEstado;
  updatedAt?: string;
};

export type CreatePlanNutricionalPayload = {
  alumnaId: string;
  evaluacionId?: string;
  titulo?: string;
  observacionesProfe?: string;
  macrosObjetivo: MacrosObjetivo;
  estructuraComidas?: EstructuraComida[];
  dias: DiaPlanNutricional[];
  generadoPorIa?: boolean;
  listasComprasSemanas?: ListaComprasSemana[];
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
