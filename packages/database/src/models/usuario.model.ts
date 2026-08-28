import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    telefono: { type: String, required: true },
    rol: { type: String, enum: ["profe", "alumna"], required: true },
    mutualista: { type: String },
    sexo: { type: String, enum: ["hombre", "mujer"] },
    alturaCm: { type: Number },
    fechaNacimiento: { type: Date },
    coberturaEmergenciaMedica: { type: String },
    lesionesPatologias: { type: String },
    alergias: { type: String },
    cedula: { type: String },
    estadoAdmision: {
      type: String,
      enum: ["pendiente", "admitida", "rechazada"],
      default: "pendiente",
    },
    metodoComprobante: {
      type: String,
      enum: ["adjunto", "whatsapp"],
    },
    comprobantePago: {
      url: { type: String },
      publicId: { type: String },
      nombreArchivo: { type: String },
      formato: { type: String },
      bytes: { type: Number },
      uploadedAt: { type: Date },
    },
    fotoPerfil: {
      url: { type: String },
      publicId: { type: String },
      uploadedAt: { type: Date },
    },
    fechaAdmision: { type: Date },
    fechaRechazo: { type: Date },
    fechaRegistro: { type: Date, default: Date.now },
    circunferenciasHabilitadas: { type: Boolean, default: false },
    tutorialesVistos: { type: Boolean, default: false },
    onboarding: {
      completado: { type: Boolean, default: false },
      version: { type: Number, default: 1 },
    },
    notificaciones: {
      pushHabilitado: { type: Boolean, default: false },
      recordatoriosEntrenamiento: { type: Boolean, default: true },
      horaEntrenamiento: { type: String },
      notificarLogros: { type: Boolean, default: true },
      notificarCheckins: { type: Boolean, default: true },
    },
    gamificacion: {
      xpTotal: { type: Number, default: 0 },
      nivel: { type: Number, default: 1 },
      rachaActual: { type: Number, default: 0 },
      rachaMaxima: { type: Number, default: 0 },
      badges: [
        {
          _id: false,
          codigo: { type: String },
          desbloqueadoAt: { type: Date },
        },
      ],
    },
    healthChangesPending: {
      mutualista: {
        proposed: { type: String },
        current: { type: String },
        requestedAt: { type: Date },
      },
      coberturaEmergenciaMedica: {
        proposed: { type: String },
        current: { type: String },
        requestedAt: { type: Date },
      },
      lesionesPatologias: {
        proposed: { type: String },
        current: { type: String },
        requestedAt: { type: Date },
      },
      alergias: {
        proposed: { type: String },
        current: { type: String },
        requestedAt: { type: Date },
      },
    },
    membresia: {
      estado: {
        type: String,
        enum: ["al_dia", "por_vencer", "vencida"],
      },
      fechaVencimiento: { type: Date },
    },
  },
  { timestamps: true, collection: "usuarios" },
);

usuarioSchema.index({ rol: 1 });
usuarioSchema.index({ rol: 1, estadoAdmision: 1 });
usuarioSchema.index({ cedula: 1 }, { unique: true, sparse: true });

export type UsuarioDocument = InferSchemaType<typeof usuarioSchema> & {
  _id: Types.ObjectId;
};

export const Usuario =
  models.Usuario ?? model<UsuarioDocument>("Usuario", usuarioSchema);
