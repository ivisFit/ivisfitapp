import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const ingredientePlanSchema = new Schema(
  {
    alimentoId: { type: Schema.Types.ObjectId, ref: "Alimento" },
    nombre: { type: String, required: true },
    cantidad: { type: Number, required: true },
    unidad: { type: String, enum: ["g", "ml", "unidad"], default: "g" },
    kcal: { type: Number },
    proteinaG: { type: Number },
    carbohidratosG: { type: Number },
    grasasG: { type: Number },
  },
  { _id: false },
);

const macrosObjetivoSchema = new Schema(
  {
    kcal: { type: Number, required: true },
    proteinaG: { type: Number, required: true },
    carbohidratosG: { type: Number, required: true },
    grasasG: { type: Number, required: true },
  },
  { _id: false },
);

const estructuraComidaSchema = new Schema(
  {
    nombre: { type: String, required: true },
    horario: { type: String },
    porcentajeKcal: { type: Number, required: true },
  },
  { _id: false },
);

const comidaPlanSchema = new Schema(
  {
    nombre: { type: String, required: true },
    horario: { type: String },
    ingredientes: { type: [ingredientePlanSchema], default: [] },
    notas: { type: String },
    preparacion: { type: String },
    macrosObjetivo: { type: macrosObjetivoSchema },
    macrosComida: { type: macrosObjetivoSchema },
  },
  { _id: false },
);

const diaPlanNutricionalSchema = new Schema(
  {
    nombre: { type: String, required: true },
    comidas: { type: [comidaPlanSchema], default: [] },
  },
  { _id: false },
);

const listaComprasItemSchema = new Schema(
  {
    nombre: { type: String, required: true },
    cantidades: { type: [String], default: [] },
  },
  { _id: false },
);

const listaComprasSemanaSchema = new Schema(
  {
    numeroSemana: { type: Number, required: true },
    items: { type: [listaComprasItemSchema], default: [] },
  },
  { _id: false },
);

const planNutricionalSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    evaluacionId: {
      type: Schema.Types.ObjectId,
      ref: "EvaluacionNutricional",
    },
    titulo: { type: String, required: true, default: "Plan nutricional" },
    estado: {
      type: String,
      enum: ["borrador", "publicado", "archivado"],
      default: "borrador",
      index: true,
    },
    observacionesProfe: { type: String },
    macrosObjetivo: { type: macrosObjetivoSchema, required: true },
    estructuraComidas: { type: [estructuraComidaSchema], default: [] },
    dias: { type: [diaPlanNutricionalSchema], required: true },
    listasComprasSemanas: { type: [listaComprasSemanaSchema], default: [] },
    generadoPorIa: { type: Boolean, default: false },
    publicadoAt: { type: Date },
    notificacionEnviada: { type: Boolean, default: false },
    clonadoDesdeId: {
      type: Schema.Types.ObjectId,
      ref: "PlanNutricional",
    },
  },
  { timestamps: true, collection: "planes_nutricionales" },
);

planNutricionalSchema.index({ alumnaId: 1, estado: 1 });

export type PlanNutricionalDocument = InferSchemaType<
  typeof planNutricionalSchema
> & {
  _id: Types.ObjectId;
};

export const PlanNutricional =
  models.PlanNutricional ??
  model<PlanNutricionalDocument>("PlanNutricional", planNutricionalSchema);
