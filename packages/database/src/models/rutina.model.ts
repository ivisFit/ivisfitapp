import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const mediaAssetSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "video", "gif"],
      required: true,
    },
    url: { type: String, required: true },
    alt: { type: String },
    posterUrl: { type: String },
  },
  { _id: false },
);

const ejercicioRutinaSchema = new Schema(
  {
    ejercicioId: {
      type: Schema.Types.ObjectId,
      ref: "Ejercicio",
      required: true,
    },
    series: { type: Number, required: true, min: 1, max: 8 },
    repeticiones: { type: Number, required: true, min: 1, max: 25 },
    descansoSegundos: { type: Number, required: true, min: 1 },
    media: { type: mediaAssetSchema },
  },
  { _id: false },
);

const storyPreviewSchema = new Schema(
  {
    background: { type: mediaAssetSchema },
    title: { type: String },
    subtitle: { type: String },
    ctaLabel: { type: String },
  },
  { _id: false },
);

const challengeDayAssetSchema = new Schema(
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

const challengeWeekAssetSchema = new Schema(
  {
    weekNumber: { type: Number, required: true, min: 1, max: 52 },
    media: { type: mediaAssetSchema },
    farewellMedia: { type: mediaAssetSchema },
  },
  { _id: false },
);

const challenge28Schema = new Schema(
  {
    title: { type: String },
    subtitle: { type: String },
    accentLabel: { type: String },
    days: { type: [challengeDayAssetSchema], default: undefined },
    weeks: { type: [challengeWeekAssetSchema], default: undefined },
  },
  { _id: false },
);

const planTemplateSnapshotSchema = new Schema(
  {
    slug: { type: String },
    nombre: { type: String, required: true },
    duracionSemanas: { type: Number, required: true },
    duracionLabel: { type: String },
    formato: { type: String },
    inversion: { type: String },
    precio: { type: Number },
    moneda: { type: String },
  },
  { _id: false },
);

const diaRutinaSchema = new Schema(
  {
    nombreDia: { type: String, required: true },
    ejercicios: { type: [ejercicioRutinaSchema], required: true },
  },
  { _id: false },
);

const semanaRutinaSchema = new Schema(
  {
    numeroSemana: { type: Number, required: true },
    dias: { type: [diaRutinaSchema], required: true },
  },
  { _id: false },
);

const rutinaSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    planTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "PlanTemplate",
    },
    planTemplateSnapshot: { type: planTemplateSnapshotSchema },
    nombrePlan: { type: String, required: true },
    duracionSemanas: { type: Number, required: true, min: 4, max: 8 },
    startDate: { type: Date },
    storyPreview: { type: storyPreviewSchema },
    challenge28: { type: challenge28Schema },
    semanas: { type: [semanaRutinaSchema], required: true },
  },
  { timestamps: true, collection: "rutinas" },
);

rutinaSchema.index({ alumnaId: 1 });

export type RutinaDocument = InferSchemaType<typeof rutinaSchema> & {
  _id: Types.ObjectId;
};

export const Rutina =
  models.Rutina ?? model<RutinaDocument>("Rutina", rutinaSchema);
