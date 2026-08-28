import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const contactoPlanSchema = new Schema(
  {
    instagram: { type: String },
    email: { type: String },
    telefono: { type: String },
    web: { type: String },
  },
  { _id: false },
);

const presentacionPlanSchema = new Schema(
  {
    nombre: { type: String, required: true },
    bio: { type: String, required: true },
    especialidades: { type: String, required: true },
    filosofia: { type: String, required: true },
    lema: { type: String, required: true },
    contacto: { type: contactoPlanSchema, required: true },
  },
  { _id: false },
);

const mediaAssetSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video", "gif"], required: true },
    url: { type: String, required: true },
    alt: { type: String },
    posterUrl: { type: String },
  },
  { _id: false },
);

const ejercicioRutinaBlueprintSchema = new Schema(
  {
    ejercicioId: { type: String, required: true },
    series: { type: Number, required: true, min: 1, max: 8 },
    repeticiones: { type: Number, required: true, min: 1, max: 25 },
    descansoSegundos: { type: Number, required: true, min: 1 },
    media: { type: mediaAssetSchema },
  },
  { _id: false },
);

const diaRutinaBlueprintSchema = new Schema(
  {
    nombreDia: { type: String, required: true },
    ejercicios: { type: [ejercicioRutinaBlueprintSchema], required: true },
  },
  { _id: false },
);

const semanaRutinaBlueprintSchema = new Schema(
  {
    numeroSemana: { type: Number, required: true },
    dias: { type: [diaRutinaBlueprintSchema], required: true },
  },
  { _id: false },
);

const storyPreviewBlueprintSchema = new Schema(
  {
    background: { type: mediaAssetSchema },
    title: { type: String },
    subtitle: { type: String },
    ctaLabel: { type: String },
  },
  { _id: false },
);

const challengeDayAssetBlueprintSchema = new Schema(
  {
    dayNumber: { type: Number, required: true, min: 1, max: 28 },
    title: { type: String },
    tags: { type: [String], default: undefined },
    media: { type: mediaAssetSchema },
    farewellMedia: { type: mediaAssetSchema },
    thumbnail: { type: mediaAssetSchema },
  },
  { _id: false },
);

const challengeWeekAssetBlueprintSchema = new Schema(
  {
    weekNumber: { type: Number, required: true, min: 1, max: 52 },
    media: { type: mediaAssetSchema },
    farewellMedia: { type: mediaAssetSchema },
  },
  { _id: false },
);

const challenge28BlueprintSchema = new Schema(
  {
    title: { type: String },
    subtitle: { type: String },
    accentLabel: { type: String },
    days: { type: [challengeDayAssetBlueprintSchema], default: undefined },
    weeks: { type: [challengeWeekAssetBlueprintSchema], default: undefined },
  },
  { _id: false },
);

const planTemplateBlueprintSchema = new Schema(
  {
    diasPorSemana: { type: Number, min: 1, max: 7 },
    nombrePlan: { type: String },
    duracionSemanas: { type: Number, min: 1, max: 52 },
    storyPreview: { type: storyPreviewBlueprintSchema },
    challenge28: { type: challenge28BlueprintSchema },
    planContentEnabled: { type: Boolean },
    semanas: { type: [semanaRutinaBlueprintSchema], default: undefined },
  },
  { _id: false },
);

const planTemplateSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    orden: { type: Number, required: true },
    nombre: { type: String, required: true },
    resumen: { type: String, required: true },
    descripcion: { type: String, required: true },
    duracionSemanas: { type: Number, required: true, min: 1, max: 52 },
    duracionLabel: { type: String, required: true },
    formato: { type: String, required: true },
    enfoque: { type: String, required: true },
    metodologia: { type: String },
    beneficios: { type: [String], default: undefined },
    extras: { type: [String], default: undefined },
    inversion: { type: String, required: true },
    precio: { type: Number },
    moneda: { type: String, default: "UYU" },
    presentacion: { type: presentacionPlanSchema, required: true },
    isActive: { type: Boolean, default: true },
    blueprint: { type: planTemplateBlueprintSchema },
  },
  { timestamps: true, collection: "plan_templates" },
);

planTemplateSchema.index({ orden: 1 });
planTemplateSchema.index({ isActive: 1, orden: 1 });

export type PlanTemplateDocument = InferSchemaType<typeof planTemplateSchema> & {
  _id: Types.ObjectId;
};

export const PlanTemplate =
  models.PlanTemplate ??
  model<PlanTemplateDocument>("PlanTemplate", planTemplateSchema);
