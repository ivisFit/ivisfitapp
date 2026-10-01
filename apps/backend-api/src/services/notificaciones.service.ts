import {
  CheckinAlimentacion,
  MensajeCoach,
  NotificacionProfe,
  Usuario,
  emitNotificacionProfe,
  notificacionAdmisionNueva,
  notificacionCheckinAtencion,
  notificacionMensajeAlumna,
  notificacionSaludPendiente,
} from "@ivisfit/database";
import { getTodayDateKey } from "./checkins-alimentacion.service.js";
import { assertFound } from "../utils/errors.js";

const HEALTH_FIELDS = [
  "mutualista",
  "coberturaEmergenciaMedica",
  "lesionesPatologias",
  "alergias",
] as const;

type HealthPending = Partial<
  Record<(typeof HEALTH_FIELDS)[number], { proposed?: string | null }>
>;

function hasHealthPending(pending: HealthPending | null | undefined) {
  if (!pending) return false;
  return HEALTH_FIELDS.some((field) => {
    const proposed = pending[field]?.proposed;
    return proposed !== undefined && proposed !== null;
  });
}

function toDto(doc: {
  _id: unknown;
  tipo: string;
  titulo: string;
  cuerpo: string;
  alumnaId?: unknown;
  href: string;
  leidaAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} | any) {
  return {
    id: String(doc._id),
    tipo: doc.tipo,
    titulo: doc.titulo,
    cuerpo: doc.cuerpo,
    alumnaId: doc.alumnaId ? String(doc.alumnaId) : null,
    href: doc.href,
    leida: doc.leidaAt != null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}

async function reconcilePendientes() {
  const pendientes = await Usuario.find({
    rol: "alumna",
    estadoAdmision: "pendiente",
  }).select("nombre");

  for (const alumna of pendientes) {
    await emitNotificacionProfe(
      notificacionAdmisionNueva(String(alumna._id), alumna.nombre),
    );
  }

  const unread = await MensajeCoach.aggregate<{
    _id: unknown;
    cuerpo: string;
  }>([
    { $match: { autorRol: "alumna", leidoAt: { $exists: false } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$alumnaId", cuerpo: { $first: "$cuerpo" } } },
  ]);

  if (unread.length > 0) {
    const ids = unread.map((row) => row._id);
    const alumnas = await Usuario.find({ _id: { $in: ids } }).select("nombre");
    const nombres = new Map(alumnas.map((alumna) => [String(alumna._id), alumna.nombre]));

    for (const row of unread) {
      const alumnaId = String(row._id);
      await emitNotificacionProfe(
        notificacionMensajeAlumna(
          alumnaId,
          nombres.get(alumnaId) ?? "Una alumna",
          row.cuerpo,
        ),
      );
    }
  }

  const conSalud = await Usuario.find({
    rol: "alumna",
    healthChangesPending: { $exists: true },
  }).select("nombre healthChangesPending");

  for (const alumna of conSalud) {
    if (!hasHealthPending(alumna.healthChangesPending as HealthPending)) continue;
    await emitNotificacionProfe(
      notificacionSaludPendiente(String(alumna._id), alumna.nombre),
    );
  }

  const checkins = await CheckinAlimentacion.find({
    dateKey: getTodayDateKey(),
    estado: { $in: ["parcial", "no_pude"] },
  }).select("alumnaId estado dateKey");

  if (checkins.length > 0) {
    const ids = checkins.map((checkin) => checkin.alumnaId);
    const alumnas = await Usuario.find({ _id: { $in: ids } }).select("nombre");
    const nombres = new Map(alumnas.map((alumna) => [String(alumna._id), alumna.nombre]));

    for (const checkin of checkins) {
      if (checkin.estado !== "parcial" && checkin.estado !== "no_pude") continue;
      const alumnaId = String(checkin.alumnaId);
      await emitNotificacionProfe(
        notificacionCheckinAtencion(
          alumnaId,
          nombres.get(alumnaId) ?? "Una alumna",
          checkin.dateKey,
          checkin.estado,
        ),
      );
    }
  }
}

let reconciled = false;
let reconciling: Promise<void> | null = null;

async function ensureReconciled() {
  if (reconciled) return;
  if (!reconciling) {
    reconciling = reconcilePendientes()
      .then(() => {
        reconciled = true;
      })
      .finally(() => {
        reconciling = null;
      });
  }
  await reconciling;
}

export const notificacionesService = {
  async list() {
    await ensureReconciled();
    const docs = await NotificacionProfe.find()
      .sort({ updatedAt: -1 })
      .limit(80)
      .lean();
    return { items: docs.map((doc) => toDto(doc)) };
  },

  async unreadCount() {
    await ensureReconciled();
    const count = await NotificacionProfe.countDocuments({ leidaAt: null });
    return { count };
  },

  async markRead(id: string) {
    const doc = await NotificacionProfe.findByIdAndUpdate(
      id,
      { leidaAt: new Date() },
      { new: true },
    ).lean();
    return toDto(assertFound(doc, "Notificación no encontrada"));
  },

  async markAllRead() {
    const result = await NotificacionProfe.updateMany(
      { leidaAt: null },
      { $set: { leidaAt: new Date() } },
    );
    return { updated: result.modifiedCount };
  },
};

