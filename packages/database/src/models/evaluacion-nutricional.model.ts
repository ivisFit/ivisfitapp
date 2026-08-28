import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const evaluacionNutricionalSchema = new Schema(
  {
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      unique: true,
    },
    edad: { type: Number, required: true },
    sexo: { type: String, enum: ["hombre", "mujer"], required: true },
    estaturaCm: { type: Number, required: true },
    pesoActualKg: { type: Number, required: true },
    pesoObjetivoKg: { type: Number, required: true },
    fechaObjetivo: { type: Date, required: true },
    nivelActividad: {
      type: String,
      enum: ["sedentario", "ligero", "moderado", "intenso", "muy_intenso"],
      required: true,
    },
    ocupacion: {
      type: String,
      enum: ["sedentario", "activo", "muy_activo"],
      required: true,
    },
    objetivo: {
      type: String,
      enum: [
        "bajar_grasa",
        "ganar_masa",
        "recomposicion",
        "mantener",
        "rendimiento",
        "salud",
      ],
      required: true,
    },
    preferenciasAlimentarias: {
      type: [String],
      enum: [
        "omnivoro",
        "vegetariano",
        "vegano",
        "keto",
        "low_carb",
        "mediterranea",
      ],
      required: true,
    },
    restricciones: {
      type: [String],
      enum: [
        "celiaquia",
        "lactosa",
        "diabetes",
        "hipertension",
        "colesterol",
        "embarazo",
      ],
      default: [],
    },
    alergias: { type: [String], default: [] },
    alimentosFavoritos: { type: [String], default: [] },
    alimentosEvitados: { type: [String], default: [] },
    horariosDisponibles: {
      type: [String],
      enum: ["manana", "tarde", "noche"],
      required: true,
    },
    cantidadComidas: { type: Number, required: true },
    presupuestoAproximado: {
      type: String,
      enum: ["bajo", "medio", "alto"],
      required: false,
    },
    tiempoCocinaMinutos: { type: Number, required: true },
    completada: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "evaluaciones_nutricionales" },
);

export type EvaluacionNutricionalDocument = InferSchemaType<
  typeof evaluacionNutricionalSchema
> & {
  _id: Types.ObjectId;
};

export const EvaluacionNutricional =
  models.EvaluacionNutricional ??
  model<EvaluacionNutricionalDocument>(
    "EvaluacionNutricional",
    evaluacionNutricionalSchema,
  );
