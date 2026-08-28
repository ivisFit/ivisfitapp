import type { Sexo } from "@/types/usuario";

export type ObjetivoNutricional =
  | "bajar_grasa"
  | "ganar_masa"
  | "recomposicion"
  | "mantener"
  | "rendimiento"
  | "salud";

export type PreferenciaAlimentaria =
  | "omnivoro"
  | "vegetariano"
  | "vegano"
  | "keto"
  | "low_carb"
  | "mediterranea";

export type RestriccionAlimentaria =
  | "celiaquia"
  | "lactosa"
  | "diabetes"
  | "hipertension"
  | "colesterol"
  | "embarazo";

export type NivelActividad =
  | "sedentario"
  | "ligero"
  | "moderado"
  | "intenso"
  | "muy_intenso";

export type Ocupacion = "sedentario" | "activo" | "muy_activo";

export type HorarioDisponible = "manana" | "tarde" | "noche";

export type PresupuestoAproximado = "bajo" | "medio" | "alto";

export type EvaluacionNutricionalApiDoc = {
  _id?: string;
  id?: string;
  alumnaId: string;
  edad: number;
  sexo: Sexo;
  estaturaCm: number;
  pesoActualKg: number;
  pesoObjetivoKg: number;
  fechaObjetivo: string;
  nivelActividad: NivelActividad;
  ocupacion: Ocupacion;
  objetivo: ObjetivoNutricional;
  preferenciasAlimentarias: PreferenciaAlimentaria[];
  restricciones: RestriccionAlimentaria[];
  alergias: string[];
  alimentosFavoritos: string[];
  alimentosEvitados: string[];
  horariosDisponibles: HorarioDisponible[];
  cantidadComidas: number;
  presupuestoAproximado?: PresupuestoAproximado;
  tiempoCocinaMinutos: number;
  completada: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateEvaluacionNutricionalPayload = Omit<
  EvaluacionNutricionalApiDoc,
  "_id" | "id" | "alumnaId" | "createdAt" | "updatedAt"
>;
