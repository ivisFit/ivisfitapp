import {
  CheckinAlimentacion,
  CoachInsight,
  Ejercicio,
  LogPeso,
  Medicion,
  PlanNutricional,
  Rutina,
  RutinaProgreso,
} from "@ivisfit/database";
import { coachGeminiService, type CoachPerfilTono } from "./coach-gemini.service.js";

const COOLDOWN_HORAS = 20;
const TIPO_COOLDOWN_HORAS = 48;
const TIME_ZONE = "America/Montevideo";

type CoachInsightTipo =
  | "dias_sin_entrenar"
  | "cumplimiento_bajo"
  | "peso_estancado"
  | "medicion_pendiente"
  | "racha_positiva"
  | "nuevo_record"
  | "alimentacion_baja"
  | "sin_plan_alimentacion"
  | "desafio_semanal"
  | "nota_coach"
  | "plan_publicado"
  | "rutina_asignada";

type Senal = {
  tipo: CoachInsightTipo;
  prioridad: number;
  hecho: string;
  fallback: string;
  accionSugerida?: string;
  perfil: CoachPerfilTono;
};

function getTodayDateKey(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const lookup = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function diasDesde(dateKey: string): number {
  const hoy = new Date(`${getTodayDateKey()}T00:00:00`);
  const fecha = new Date(`${dateKey}T00:00:00`);
  return Math.round((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateKeyDaysAgo(days: number): string {
  const hoy = new Date(`${getTodayDateKey()}T12:00:00`);
  hoy.setDate(hoy.getDate() - days);
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function weekdayInMontevideo(): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
  });
  const day = formatter.format(new Date());
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };
  return map[day] ?? new Date().getDay();
}

function maxPesoSerie(pesos: number[]): number {
  return pesos.reduce((max, peso) => (peso > max ? peso : max), 0);
}

async function detectarSenalesRutina(alumnaId: string): Promise<Senal[]> {
  const rutina = await Rutina.findOne({ alumnaId }).sort({ createdAt: -1 });
  if (!rutina) return [];

  const diasPorSemana = rutina.semanas[0]?.dias.length ?? 0;
  if (diasPorSemana === 0) return [];

  const rutinaCreadaHaceDias = diasDesde(toDateKey(rutina.createdAt as unknown as Date));
  const progreso = await RutinaProgreso.find({
    alumnaId,
    rutinaId: rutina._id,
  }).sort({ dateKey: -1 });
  const completados = progreso.filter((registro) => registro.diaCompletado);

  const senales: Senal[] = [];

  const diasSinEntrenar = completados[0]
    ? diasDesde(completados[0].dateKey)
    : rutinaCreadaHaceDias;

  if (diasSinEntrenar >= 3 && rutinaCreadaHaceDias >= 3) {
    senales.push({
      tipo: "dias_sin_entrenar",
      prioridad: 5,
      hecho: `La alumna lleva ${diasSinEntrenar} días sin marcar un entrenamiento completado en su rutina "${rutina.nombrePlan}".`,
      fallback: `Llevás ${diasSinEntrenar} días sin marcar tu rutina. ¿Probamos una sesión corta hoy?`,
      accionSugerida: "Abrí tu rutina de hoy y sumá aunque sea una sesión corta.",
      perfil: "motivacion",
    });
  }

  if (rutinaCreadaHaceDias >= 7) {
    const haceUnaSemana = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const haceDosSemanas = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const completadosSemana = completados.filter(
      (registro) => new Date(`${registro.dateKey}T00:00:00`).getTime() >= haceUnaSemana,
    ).length;
    const completadosSemanaPasada = completados.filter((registro) => {
      const t = new Date(`${registro.dateKey}T00:00:00`).getTime();
      return t >= haceDosSemanas && t < haceUnaSemana;
    }).length;
    const pct = Math.min(100, Math.round((completadosSemana / diasPorSemana) * 100));

    if (pct < 50) {
      senales.push({
        tipo: "cumplimiento_bajo",
        prioridad: 4,
        hecho: `Esta semana la alumna completó ${completadosSemana} de ${diasPorSemana} días programados de entrenamiento (${pct}%).`,
        fallback: `Esta semana completaste ${completadosSemana} de ${diasPorSemana} días. ¿Qué te frenó? Contame y vemos cómo ajustar.`,
        accionSugerida: "Contale a tu asistente qué se te dificultó esta semana.",
        perfil: "organizacion",
      });
    } else if (pct >= 100) {
      senales.push({
        tipo: "racha_positiva",
        prioridad: 1,
        hecho: `La alumna completó el 100% de sus ${diasPorSemana} días programados de entrenamiento esta semana.`,
        fallback: `¡Completaste todos tus días de entrenamiento esta semana! Eso es constancia real.`,
        perfil: "celebracion",
      });
    }

    const weekday = weekdayInMontevideo();
    if (weekday >= 1 && weekday <= 3) {
      const meta = Math.max(
        2,
        Math.min(diasPorSemana, completadosSemanaPasada + 1),
      );
      if (completadosSemana < meta) {
        senales.push({
          tipo: "desafio_semanal",
          prioridad: 2,
          hecho: `Desafío semanal sugerido: completar ${meta} entrenamientos esta semana (lleva ${completadosSemana} hasta ahora; la semana pasada hizo ${completadosSemanaPasada}).`,
          fallback: `Esta semana intentemos completar ${meta} entrenamientos. Vas ${completadosSemana}: ¿sumamos uno más?`,
          accionSugerida: `Meta de la semana: ${meta} entrenamientos.`,
          perfil: "organizacion",
        });
      }
    }
  }

  return senales;
}

async function detectarSenalesMedicion(alumnaId: string): Promise<Senal[]> {
  const mediciones = await Medicion.find({ alumnaId }).sort({ fecha: -1 }).limit(6);
  const senales: Senal[] = [];

  const pesos = mediciones.filter((m) => typeof m.pesoCorporalKg === "number");
  if (pesos.length >= 3) {
    const recientes = pesos.slice(0, 3);
    const valores = recientes.map((m) => m.pesoCorporalKg as number);
    const spread = Math.max(...valores) - Math.min(...valores);
    const diasEntreMediciones = diasDesde(
      toDateKey(recientes[recientes.length - 1].fecha as unknown as Date),
    );

    if (spread <= 0.5 && diasEntreMediciones >= 21) {
      senales.push({
        tipo: "peso_estancado",
        prioridad: 3,
        hecho: `El peso corporal de la alumna se mantuvo estable (variación de ${spread.toFixed(1)} kg) en sus últimas ${recientes.length} mediciones, a lo largo de ${diasEntreMediciones} días.`,
        fallback:
          "Tu peso se mantuvo estable en las últimas semanas. Puede ser normal, ¿querés que revisemos las porciones juntas?",
        accionSugerida: "Revisá tu plan de alimentación o consultale a tu asistente.",
        perfil: "recordatorio",
      });
    }
  }

  const ultimaMedicion = mediciones[0];
  const diasDesdeMedicion = ultimaMedicion
    ? diasDesde(toDateKey(ultimaMedicion.fecha as unknown as Date))
    : null;

  if (!ultimaMedicion || (diasDesdeMedicion !== null && diasDesdeMedicion >= 42)) {
    const semanas = diasDesdeMedicion !== null ? Math.round(diasDesdeMedicion / 7) : null;
    senales.push({
      tipo: "medicion_pendiente",
      prioridad: 2,
      hecho: ultimaMedicion
        ? `Pasaron ${semanas} semanas desde la última medición de pliegues de la alumna.`
        : "La alumna todavía no tiene ninguna medición de pliegues registrada.",
      fallback: semanas
        ? `Hace ${semanas} semanas de tu último control. ¿Coordinamos una nueva medición con Ivis?`
        : "Todavía no tenés una medición registrada. ¿Coordinamos una con Ivis?",
      accionSugerida: "Coordiná con Ivis tu próxima medición de pliegues.",
      perfil: "recordatorio",
    });
  }

  return senales;
}

async function detectarSenalesRecord(alumnaId: string): Promise<Senal[]> {
  const logs = await LogPeso.find({ alumnaId }).sort({ fecha: -1 }).limit(200);
  if (logs.length < 2) return [];

  const byEjercicio = new Map<string, typeof logs>();
  for (const log of logs) {
    const key = String(log.ejercicioId);
    const list = byEjercicio.get(key) ?? [];
    list.push(log);
    byEjercicio.set(key, list);
  }

  let mejor: { ejercicioId: string; nuevoMax: number; anteriorMax: number } | null =
    null;

  for (const [ejercicioId, list] of byEjercicio) {
    if (list.length < 2) continue;
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.fecha as unknown as Date).getTime() -
        new Date(a.fecha as unknown as Date).getTime(),
    );
    const reciente = sorted[0];
    const diasDesdeLog = diasDesde(toDateKey(reciente.fecha as unknown as Date));
    if (diasDesdeLog > 3) continue;

    const nuevoMax = maxPesoSerie(reciente.pesosPorSerie ?? []);
    if (nuevoMax <= 0) continue;

    const anteriores = sorted.slice(1);
    const anteriorMax = anteriores.reduce(
      (max, log) => Math.max(max, maxPesoSerie(log.pesosPorSerie ?? [])),
      0,
    );
    if (anteriorMax > 0 && nuevoMax > anteriorMax) {
      if (!mejor || nuevoMax - anteriorMax > mejor.nuevoMax - mejor.anteriorMax) {
        mejor = { ejercicioId, nuevoMax, anteriorMax };
      }
    }
  }

  if (!mejor) return [];

  const ejercicio = await Ejercicio.findById(mejor.ejercicioId).select("nombre");
  const nombre = ejercicio?.nombre ?? "un ejercicio";

  return [
    {
      tipo: "nuevo_record",
      prioridad: 1,
      hecho: `La alumna alcanzó un nuevo récord en ${nombre}: ${mejor.nuevoMax} kg (antes ${mejor.anteriorMax} kg).`,
      fallback: `¡Nuevo récord en ${nombre}! Pasaste de ${mejor.anteriorMax} kg a ${mejor.nuevoMax} kg. Eso es progreso real.`,
      accionSugerida: "Seguí registrando tus cargas en Progreso.",
      perfil: "celebracion",
    },
  ];
}

async function detectarSenalesAlimentacion(alumnaId: string): Promise<Senal[]> {
  const senales: Senal[] = [];
  const plan = await PlanNutricional.findOne({
    alumnaId,
    estado: "publicado",
  }).sort({ publicadoAt: -1, updatedAt: -1 });

  const rutina = await Rutina.findOne({ alumnaId }).sort({ createdAt: -1 });

  if (rutina && !plan) {
    senales.push({
      tipo: "sin_plan_alimentacion",
      prioridad: 2,
      hecho: "La alumna tiene rutina activa pero todavía no tiene un plan nutricional publicado.",
      fallback:
        "Todavía no tenés un plan de alimentación publicado. Si ya hiciste la evaluación, Ivis lo está preparando; si no, podés empezar desde Alimentación.",
      accionSugerida: "Revisá la sección Alimentación o hablá con Ivis.",
      perfil: "recordatorio",
    });
    return senales;
  }

  if (!plan) return senales;

  const publicadoAt = (plan.publicadoAt ?? plan.createdAt) as Date | undefined;
  if (publicadoAt && diasDesde(toDateKey(publicadoAt)) < 4) {
    return senales;
  }

  const fromKey = dateKeyDaysAgo(6);
  const toKey = getTodayDateKey();
  const checkins = await CheckinAlimentacion.find({
    alumnaId,
    dateKey: { $gte: fromKey, $lte: toKey },
  });

  const noPude = checkins.filter((c) => c.estado === "no_pude").length;
  if (checkins.length < 3 || (checkins.length >= 4 && noPude > checkins.length / 2)) {
    senales.push({
      tipo: "alimentacion_baja",
      prioridad: 4,
      hecho:
        checkins.length < 3
          ? `En los últimos 7 días la alumna registró solo ${checkins.length} check-ins de alimentación.`
          : `En los últimos 7 días la alumna marcó "no pude" en ${noPude} de ${checkins.length} check-ins de alimentación.`,
      fallback:
        "Veo que la alimentación te está costando registrar o cumplir. ¿Querés que te ayude a simplificar el día a día?",
      accionSugerida: "Hacé el check-in de hoy en Alimentación o pedile ideas al asistente.",
      perfil: "organizacion",
    });
  }

  return senales;
}

function perfilParaTipo(tipo: CoachInsightTipo): CoachPerfilTono {
  switch (tipo) {
    case "dias_sin_entrenar":
      return "motivacion";
    case "cumplimiento_bajo":
    case "alimentacion_baja":
    case "desafio_semanal":
      return "organizacion";
    case "racha_positiva":
    case "nuevo_record":
      return "celebracion";
    default:
      return "recordatorio";
  }
}

export const coachProgresoService = {
  async evaluar(alumnaId: string) {
    const ultimoInsight = await CoachInsight.findOne({ alumnaId }).sort({ createdAt: -1 });
    if (ultimoInsight?.createdAt) {
      const horasDesdeUltimo =
        (Date.now() - new Date(ultimoInsight.createdAt).getTime()) / (1000 * 60 * 60);
      if (horasDesdeUltimo < COOLDOWN_HORAS) return null;
    }

    const [senalesRutina, senalesMedicion, senalesRecord, senalesAlimentacion] =
      await Promise.all([
        detectarSenalesRutina(alumnaId),
        detectarSenalesMedicion(alumnaId),
        detectarSenalesRecord(alumnaId),
        detectarSenalesAlimentacion(alumnaId),
      ]);

    const candidatas = [
      ...senalesRutina,
      ...senalesMedicion,
      ...senalesRecord,
      ...senalesAlimentacion,
    ].sort((a, b) => b.prioridad - a.prioridad);

    const tipoCooldownDesde = new Date(Date.now() - TIPO_COOLDOWN_HORAS * 60 * 60 * 1000);
    const recientesPorTipo = await CoachInsight.find({
      alumnaId,
      createdAt: { $gte: tipoCooldownDesde },
    }).select("tipo leido");

    const tiposBloqueados = new Set(
      recientesPorTipo
        .filter(
          (insight) =>
            !insight.leido ||
            insight.tipo === "desafio_semanal" ||
            insight.tipo === "nuevo_record",
        )
        .map((insight) => insight.tipo as string),
    );

    // Also block unread of any type
    for (const insight of recientesPorTipo) {
      if (!insight.leido) tiposBloqueados.add(insight.tipo as string);
    }

    const unread = await CoachInsight.findOne({
      alumnaId,
      leido: false,
      tipo: {
        $nin: ["nota_coach", "plan_publicado", "rutina_asignada"],
      },
    });
    if (unread) return null;

    const senal = candidatas.find((s) => !tiposBloqueados.has(s.tipo));
    if (!senal) return null;

    const perfil = senal.perfil ?? perfilParaTipo(senal.tipo);
    const mensaje = await coachGeminiService.redactar(
      senal.hecho,
      senal.fallback,
      perfil,
    );

    return CoachInsight.create({
      alumnaId,
      tipo: senal.tipo,
      mensaje,
      prioridad: senal.prioridad,
      accionSugerida: senal.accionSugerida,
      perfil,
    });
  },

  async list(alumnaId: string) {
    return CoachInsight.find({ alumnaId }).sort({ createdAt: -1 }).limit(10);
  },

  async marcarLeido(alumnaId: string, id: string) {
    return CoachInsight.findOneAndUpdate(
      { _id: id, alumnaId },
      { $set: { leido: true } },
      { new: true },
    );
  },
};
