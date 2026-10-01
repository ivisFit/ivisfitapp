import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";
const macrosObjetivoMongoose = new Schema(
  {
    kcal: { type: Number, required: true },
    proteinaG: { type: Number, required: true },
    carbohidratosG: { type: Number, required: true },
    grasasG: { type: Number, required: true },
  },
  { _id: false },
);

const ingredientePlanMongoose = new Schema(
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

const comidaPlanMongoose = new Schema(
  {
    nombre: { type: String, required: true },
    horario: { type: String },
    ingredientes: { type: [ingredientePlanMongoose], default: [] },
    notas: { type: String },
    preparacion: { type: String },
    macrosObjetivo: { type: macrosObjetivoMongoose },
    macrosComida: { type: macrosObjetivoMongoose },
  },
  { _id: false },
);

const diaPlanMongoose = new Schema(
  {
    nombre: { type: String, required: true },
    comidas: { type: [comidaPlanMongoose], default: [] },
  },
  { _id: false },
);

const estructuraComidaMongoose = new Schema(
  {
    nombre: { type: String, required: true },
    horario: { type: String },
    porcentajeKcal: { type: Number, required: true },
  },
  { _id: false },
);

const planNutricionalTemplateSchema = new Schema(
  {
    profeId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    titulo: { type: String, required: true },
    descripcion: { type: String },
    macrosObjetivo: { type: macrosObjetivoMongoose, required: true },
    estructuraComidas: { type: [estructuraComidaMongoose], default: [] },
    dias: { type: [diaPlanMongoose], required: true },
  },
  { timestamps: true, collection: "plan_nutricional_templates" },
);

export type PlanNutricionalTemplateDocument = InferSchemaType<
  typeof planNutricionalTemplateSchema
> & {
  _id: Types.ObjectId;
};

export const PlanNutricionalTemplate =
  models.PlanNutricionalTemplate ??
  model<PlanNutricionalTemplateDocument>(
    "PlanNutricionalTemplate",
    planNutricionalTemplateSchema,
  );
