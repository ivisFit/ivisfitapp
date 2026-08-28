import {
  AutomationRun,
  CheckinAlimentacion,
  CoachInsight,
  ConversacionAsistente,
  ResumenSemanal,
  Rutina,
  RutinaProgreso,
  Usuario,
} from "@ivisfit/database";
import {
  sendRecordatorioEntrenamientoEmail,
  sendResumenSemanalEmail,
} from "@ivisfit/mail";
import { getAppName, getAppUrl, resolveAlumnaEmail } from "../lib/email.js";
import { buildWhatsAppIvisHref } from "../lib/whatsapp.js";

const TIMEZONE = "America/Montevideo";

function getZonedParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
}

function todayKey() {
  const p = getZonedParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function currentHora() {
  const p = getZonedParts();
  return `${p.hour}:${p.minute}`;
}

function weekKeyFromDate(date = new Date()) {
  const p = getZonedParts(date);
  // ISO-ish week label by Sunday date of current week in UY
  return `${p.year}-W${p.month}${p.day}`;
}

async function claimRun(job: string, key: string, meta?: unknown) {
  try {
    await AutomationRun.create({ job, key, ranAt: new Date(), meta });
    return true;
  } catch {
    return false;
  }
}

async function runLimpiarHistorialAsistente() {
  const p = getZonedParts();
  if (p.hour !== "00" || Number(p.minute) >= 5) return;

  const dateKey = todayKey();
  const claimed = await claimRun("limpiar_historial_asistente", dateKey);
  if (!claimed) return;

  await ConversacionAsistente.updateMany(
    { historialDateKey: { $ne: dateKey } },
    { $set: { mensajes: [], historialDateKey: dateKey } },
  );
}

async function runRecordatorios() {
  const hora = currentHora();
  const dateKey = todayKey();
  const jobKeyPrefix = `recordatorio:${dateKey}:${hora}`;

  const alumnas = await Usuario.find({
    rol: "alumna",
    $or: [
      { estadoAdmision: "admitida" },
      { estadoAdmision: { $exists: false } },
    ],
    "notificaciones.recordatoriosEntrenamiento": { $ne: false },
    "notificaciones.horaEntrenamiento": hora,
  }).select("nombre correo notificaciones");

  for (const alumna of alumnas) {
    const claimed = await claimRun(
      "recordatorio_entreno",
      `${jobKeyPrefix}:${alumna._id}`,
    );
    if (!claimed) continue;

    const hasRutina = await Rutina.exists({ alumnaId: alumna._id });
    if (!hasRutina) continue;

    const to = resolveAlumnaEmail(alumna);
    if (!to) continue;

    try {
      await sendRecordatorioEntrenamientoEmail({
        to,
        alumnaNombre: alumna.nombre,
        hora,
        appName: getAppName(),
        appUrl: getAppUrl(),
      });
    } catch (error) {
      console.error("Recordatorio email falló:", error);
    }
  }
}

async function runInactividad() {
  const dateKey = todayKey();
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 7);

  const alumnas = await Usuario.find({
    rol: "alumna",
    $or: [
      { estadoAdmision: "admitida" },
      { estadoAdmision: { $exists: false } },
    ],
  }).select("_id nombre");

  for (const alumna of alumnas) {
    const hasRutina = await Rutina.exists({ alumnaId: alumna._id });
    if (!hasRutina) continue;

    const reciente = await RutinaProgreso.findOne({
      alumnaId: alumna._id,
      diaCompletado: true,
      updatedAt: { $gte: cutoff },
    }).select("_id");

    if (reciente) continue;

    const claimed = await claimRun(
      "inactividad_7d",
      `inactividad:${dateKey.slice(0, 7)}:${alumna._id}`,
    );
    if (!claimed) continue;

    const unread = await CoachInsight.findOne({
      alumnaId: alumna._id,
      leido: false,
      tipo: "dias_sin_entrenar",
    });
    if (unread) continue;

    await CoachInsight.create({
      alumnaId: alumna._id,
      tipo: "dias_sin_entrenar",
      mensaje:
        "Llevás varios días sin marcar un entrenamiento. ¿Volvemos con una sesión corta hoy?",
      prioridad: 5,
      leido: false,
      accionSugerida: "Abrí Mi rutina",
      perfil: "motivacion",
    });
  }
}

async function runResumenSemanal() {
  const parts = getZonedParts();
  if (parts.weekday !== "Sun") return;
  const hour = Number(parts.hour);
  if (hour < 18 || hour > 19) return;

  const semanaKey = weekKeyFromDate();
  const claimedGlobal = await claimRun("resumen_semanal_tick", semanaKey);
  if (!claimedGlobal) return;

  const alumnas = await Usuario.find({
    rol: "alumna",
    $or: [
      { estadoAdmision: "admitida" },
      { estadoAdmision: { $exists: false } },
    ],
  }).select("nombre correo gamificacion");

  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);

  for (const alumna of alumnas) {
    const claimed = await claimRun(
      "resumen_semanal",
      `${semanaKey}:${alumna._id}`,
    );
    if (!claimed) continue;

    const [entrenos, checkins] = await Promise.all([
      RutinaProgreso.countDocuments({
        alumnaId: alumna._id,
        diaCompletado: true,
        updatedAt: { $gte: weekStart },
      }),
      CheckinAlimentacion.find({
        alumnaId: alumna._id,
        dateKey: { $gte: todayKey().slice(0, 8) },
      }).select("estado"),
    ]);

    const fromKeyDate = new Date();
    fromKeyDate.setUTCDate(fromKeyDate.getUTCDate() - 6);
    const fromParts = getZonedParts(fromKeyDate);
    const fromKey = `${fromParts.year}-${fromParts.month}-${fromParts.day}`;
    const weekCheckins = await CheckinAlimentacion.find({
      alumnaId: alumna._id,
      dateKey: { $gte: fromKey, $lte: todayKey() },
    }).select("estado");

    const checkinsCumplidos = weekCheckins.filter((c) => c.estado === "cumpli")
      .length;
    const checkinsParciales = weekCheckins.filter((c) => c.estado === "parcial")
      .length;
    const checkinsNoPude = weekCheckins.filter((c) => c.estado === "no_pude")
      .length;
    const racha = alumna.gamificacion?.rachaActual ?? 0;

    await ResumenSemanal.findOneAndUpdate(
      { alumnaId: alumna._id, semanaKey },
      {
        alumnaId: alumna._id,
        semanaKey,
        entrenosCompletados: entrenos,
        checkinsCumplidos,
        checkinsParciales,
        checkinsNoPude,
        racha,
        enviadoAt: new Date(),
      },
      { upsert: true },
    );

    const to = resolveAlumnaEmail(alumna);
    if (!to) continue;
    try {
      await sendResumenSemanalEmail({
        to,
        alumnaNombre: alumna.nombre,
        entrenosCompletados: entrenos,
        checkinsCumplidos,
        checkinsParciales,
        checkinsNoPude,
        racha,
        appName: getAppName(),
        appUrl: getAppUrl(),
      });
    } catch (error) {
      console.error("Resumen semanal email falló:", error);
    }
  }
}

async function runMembresias() {
  const dateKey = todayKey();
  const claimed = await claimRun("membresias", dateKey);
  if (!claimed) return;

  const now = new Date();
  const in7 = new Date(now);
  in7.setUTCDate(in7.getUTCDate() + 7);

  const alumnas = await Usuario.find({
    rol: "alumna",
    "membresia.fechaVencimiento": { $exists: true, $ne: null },
  }).select("membresia");

  for (const alumna of alumnas) {
    const fecha = alumna.membresia?.fechaVencimiento;
    if (!fecha) continue;

    let estado: "al_dia" | "por_vencer" | "vencida" = "al_dia";
    if (fecha < now) estado = "vencida";
    else if (fecha <= in7) estado = "por_vencer";

    if (alumna.membresia?.estado !== estado) {
      alumna.membresia = {
        estado,
        fechaVencimiento: fecha,
      };
      await alumna.save();
    }
  }
}

export async function getAutomatizacionesStatus() {
  const enabled = process.env.SCHEDULER_ENABLED === "true";
  const latest = await AutomationRun.find()
    .sort({ ranAt: -1 })
    .limit(20)
    .lean();

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 7);
  const inactive = await Usuario.find({
    rol: "alumna",
    $or: [
      { estadoAdmision: "admitida" },
      { estadoAdmision: { $exists: false } },
    ],
  })
    .select("_id nombre")
    .lean();

  const inactiveList: Array<{
    id: string;
    nombre: string;
    whatsappHref: string;
  }> = [];

  for (const alumna of inactive) {
    const hasRutina = await Rutina.exists({ alumnaId: alumna._id });
    if (!hasRutina) continue;
    const reciente = await RutinaProgreso.findOne({
      alumnaId: alumna._id,
      diaCompletado: true,
      updatedAt: { $gte: cutoff },
    }).select("_id");
    if (reciente) continue;
    inactiveList.push({
      id: String(alumna._id),
      nombre: alumna.nombre,
      whatsappHref: buildWhatsAppIvisHref(
        alumna.nombre,
        "quiero retomar el entrenamiento",
      ),
    });
  }

  const resumenes = await ResumenSemanal.find()
    .sort({ enviadoAt: -1 })
    .limit(30)
    .populate("alumnaId", "nombre")
    .lean();

  return {
    enabled,
    tickMs: Number(process.env.SCHEDULER_TICK_MS ?? 300000),
    jobs: [
      {
        id: "recordatorio_entreno",
        label: "Recordatorio de entrenamiento por email",
      },
      { id: "inactividad_7d", label: "Insight por 7 días sin entrenar" },
      { id: "resumen_semanal", label: "Resumen semanal (domingo ~18:00 UY)" },
      { id: "membresias", label: "Recalcular estado de membresía" },
      {
        id: "limpiar_historial_asistente",
        label: "Limpiar historial del asistente (00:00 UY)",
      },
    ],
    latestRuns: latest.map((run) => ({
      job: run.job,
      key: run.key,
      ranAt: run.ranAt,
    })),
    alumnasInactivas: inactiveList,
    resumenesSemanales: resumenes.map((r) => ({
      id: String(r._id),
      alumnaId: String(
        typeof r.alumnaId === "object" && r.alumnaId && "_id" in r.alumnaId
          ? (r.alumnaId as { _id: unknown })._id
          : r.alumnaId,
      ),
      alumnaNombre:
        typeof r.alumnaId === "object" &&
        r.alumnaId &&
        "nombre" in r.alumnaId
          ? String((r.alumnaId as { nombre?: string }).nombre ?? "Alumna")
          : "Alumna",
      semanaKey: r.semanaKey,
      entrenosCompletados: r.entrenosCompletados,
      checkinsCumplidos: r.checkinsCumplidos,
      racha: r.racha,
      enviadoAt: r.enviadoAt,
    })),
  };
}

let timer: ReturnType<typeof setInterval> | null = null;

export function startScheduler() {
  if (process.env.SCHEDULER_ENABLED !== "true") {
    console.log("[scheduler] deshabilitado (SCHEDULER_ENABLED!=true)");
    return;
  }

  const tickMs = Number(process.env.SCHEDULER_TICK_MS ?? 300000);
  console.log(`[scheduler] activo cada ${tickMs}ms`);

  const tick = async () => {
    try {
      await runRecordatorios();
      await runInactividad();
      await runResumenSemanal();
      await runMembresias();
      await runLimpiarHistorialAsistente();
    } catch (error) {
      console.error("[scheduler] error en tick:", error);
    }
  };

  void tick();
  timer = setInterval(() => void tick(), tickMs);
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
