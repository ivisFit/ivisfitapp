import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

export const NOTIFICACION_PROFE_TIPOS = [
  "admision_nueva",
  "mensaje_alumna",
  "salud_pendiente",
  "evaluacion_completada",
  "checkin_atencion",
  "inactividad_7d",
  "membresia_por_vencer",
  "membresia_vencida",
] as const;

export type NotificacionProfeTipo = (typeof NOTIFICACION_PROFE_TIPOS)[number];

const notificacionProfeSchema = new Schema(
  {
    tipo: {
      type: String,
      enum: NOTIFICACION_PROFE_TIPOS,
      required: true,
    },
    titulo: { type: String, required: true, maxlength: 160 },
    cuerpo: { type: String, required: true, maxlength: 500 },
    alumnaId: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
    },
    href: { type: String, required: true, maxlength: 300 },
    clave: { type: String, required: true, unique: true },
    leidaAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "notificaciones_profe" },
);

notificacionProfeSchema.index({ leidaAt: 1, updatedAt: -1 });

export type NotificacionProfeDocument = InferSchemaType<typeof notificacionProfeSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const NotificacionProfe: Model<NotificacionProfeDocument> =
  (models.NotificacionProfe as Model<NotificacionProfeDocument> | undefined) ??
  model<NotificacionProfeDocument>("NotificacionProfe", notificacionProfeSchema);
