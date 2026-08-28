import {
  CheckinAlimentacion,
  EvaluacionNutricional,
  LogPeso,
  PlanNutricional,
  Rutina,
  RutinaProgreso,
  Usuario,
} from "@ivisfit/database";

const TIMEZONE = "America/Montevideo";

const ADMITTED_ALUMNA_FILTER = {
  rol: "alumna" as const,
  $or: [
    { estadoAdmision: "admitida" as const },
    { estadoAdmision: { $exists: false } },
  ],
};

type ActivityTipo = "rutina_completada" | "admision" | "registro_peso";

interface ActivityItem {
  id: string;
  tipo: ActivityTipo;
  titulo: string;
  ocurrioEn: Date;
}

interface TrendPoint {
  dia: string;
  completados: number;
}

interface AlumnaAtencionItem {
  id: string;
  nombre: string;
  adherencia: number;
}

function getZonedParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = formatter.formatToParts(date);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
}

function getMonthBounds(reference = new Date()) {
  const parts = getZonedParts(reference);
  const year = Number(parts.year);
  const month = Number(parts.month);
  const start = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 2, 59, 59));
  return { start, end };
}

function isoDateLabel(date: Date): string {
  const parts = getZonedParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function percentDelta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return roundOneDecimal(((current - previous) / previous) * 100);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function startOfDay(date: Date) {
  const parts = getZonedParts(date);
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0));
}

function resolveAlumnaNombre(
  alumnaId: unknown,
  fallback = "Alumna",
): string {
  if (
    typeof alumnaId === "object" &&
    alumnaId !== null &&
    "nombre" in alumnaId &&
    typeof (alumnaId as { nombre?: unknown }).nombre === "string"
  ) {
    return (alumnaId as { nombre: string }).nombre;
  }
  return fallback;
}

function weekdayLabelFromDate(date: Date): string {
  const labels: Record<string, string> = {
    Mon: "Lun",
    Tue: "Mar",
    Wed: "Mié",
    Thu: "Jue",
    Fri: "Vie",
    Sat: "Sáb",
    Sun: "Dom",
  };
  const weekday = getZonedParts(date).weekday?.slice(0, 3) ?? "Mon";
  return labels[weekday] ?? weekday;
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

async function countAlumnasActivas() {
  return Usuario.countDocuments(ADMITTED_ALUMNA_FILTER);
}

async function countEntrenamientosPlanificados() {
  const result = await Rutina.aggregate<{ total: number }>([
    { $unwind: "$semanas" },
    {
      $group: {
        _id: null,
        total: { $sum: { $size: "$semanas.dias" } },
      },
    },
  ]);
  return result[0]?.total ?? 0;
}

async function calcularIngresosMes(reference = new Date()) {
  const { start, end } = getMonthBounds(reference);
  const alumnas = await Usuario.find({
    ...ADMITTED_ALUMNA_FILTER,
    fechaAdmision: { $gte: start, $lte: end },
  }).select("_id");

  if (alumnas.length === 0) {
    return { monto: 0, moneda: "UYU" };
  }

  const alumnaIds = alumnas.map((a) => a._id);
  const rutinas = await Rutina.find({ alumnaId: { $in: alumnaIds } }).select(
    "planTemplateSnapshot",
  );

  let monto = 0;
  let moneda = "UYU";

  for (const rutina of rutinas) {
    const precio = rutina.planTemplateSnapshot?.precio;
    if (typeof precio === "number" && precio > 0) {
      monto += precio;
      if (rutina.planTemplateSnapshot?.moneda) {
        moneda = rutina.planTemplateSnapshot.moneda;
      }
    }
  }

  return { monto, moneda };
}

async function calcularSatisfaccionPromedio() {
  const rutinas = await Rutina.find().select("_id semanas");
  if (rutinas.length === 0) return 0;

  const adherences: number[] = [];

  for (const rutina of rutinas) {
    let plannedDays = 0;
    for (const semana of rutina.semanas) {
      plannedDays += semana.dias.length;
    }
    if (plannedDays === 0) continue;

    const completedDays = await RutinaProgreso.countDocuments({
      rutinaId: rutina._id,
      diaCompletado: true,
    });

    adherences.push((completedDays / plannedDays) * 100);
  }

  if (adherences.length === 0) return 0;

  const avgAdherence =
    adherences.reduce((sum, value) => sum + value, 0) / adherences.length;
  return roundOneDecimal((avgAdherence / 100) * 5);
}

async function calcularNuevasAlumnas(reference = new Date()) {
  const { start, end } = getMonthBounds(reference);
  return Usuario.countDocuments({
    ...ADMITTED_ALUMNA_FILTER,
    fechaAdmision: { $gte: start, $lte: end },
  });
}

async function contarEntrenamientosCompletados(reference = new Date()) {
  const { start, end } = getMonthBounds(reference);
  return RutinaProgreso.countDocuments({
    diaCompletado: true,
    updatedAt: { $gte: start, $lte: end },
  });
}

async function buildTendencias() {
  const now = new Date();
  const prev = new Date(now);
  prev.setUTCMonth(prev.getUTCMonth() - 1);

  const [
    alumnasNuevas,
    alumnasNuevasAnterior,
    ingresosMes,
    ingresosAnterior,
    completadosActual,
    completadosAnterior,
  ] = await Promise.all([
    calcularNuevasAlumnas(now),
    calcularNuevasAlumnas(prev),
    calcularIngresosMes(now),
    calcularIngresosMes(prev),
    contarEntrenamientosCompletados(now),
    contarEntrenamientosCompletados(prev),
  ]);

  return {
    alumnasNuevas,
    alumnasNuevasDelta: percentDelta(alumnasNuevas, alumnasNuevasAnterior),
    ingresosMes,
    ingresosDelta: percentDelta(ingresosMes.monto, ingresosAnterior.monto),
    entrenamientosDelta: percentDelta(completadosActual, completadosAnterior),
  };
}

async function buildProgreso30d() {
  const today = startOfDay(new Date());
  const start = addDays(today, -29);
  const end = new Date(addDays(today, 1).getTime() - 1);

  const progresos = await RutinaProgreso.find({
    diaCompletado: true,
    updatedAt: { $gte: start, $lte: end },
  }).select("updatedAt");

  const counts = new Map<string, number>();
  for (const progreso of progresos) {
    const key = isoDateLabel(progreso.updatedAt ?? new Date());
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const points: TrendPoint[] = [];
  for (let i = 0; i < 30; i += 1) {
    const date = addDays(start, i);
    points.push({
      dia: isoDateLabel(date),
      completados: counts.get(isoDateLabel(date)) ?? 0,
    });
  }
  return points;
}

async function buildAlumnasAtencion() {
  const recentCutoff = new Date();
  recentCutoff.setUTCDate(recentCutoff.getUTCDate() - 60);

  const rutinas = await Rutina.find({
    $or: [
      { startDate: { $gte: recentCutoff } },
      { startDate: { $exists: false } },
    ],
  })
    .select("alumnaId semanas")
    .populate("alumnaId", "nombre")
    .limit(400);

  if (rutinas.length === 0) return [];

  const rutinaIds = rutinas.map((r) => r._id);
  const completions = await RutinaProgreso.aggregate<{ _id: unknown; count: number }>([
    { $match: { rutinaId: { $in: rutinaIds }, diaCompletado: true } },
    { $group: { _id: "$rutinaId", count: { $sum: 1 } } },
  ]);
  const completedByRutina = new Map<string, number>(
    completions.map((c) => [String(c._id), c.count]),
  );

  const items: AlumnaAtencionItem[] = [];

  for (const rutina of rutinas) {
    let plannedDays = 0;
    for (const semana of rutina.semanas) {
      plannedDays += semana.dias.length;
    }
    if (plannedDays === 0) continue;

    const completedDays = completedByRutina.get(String(rutina._id)) ?? 0;
    const adherencia = (completedDays / plannedDays) * 100;
    if (adherencia >= 50) continue;

    const populatedAlumna = rutina.alumnaId as { _id?: unknown } | null;
    items.push({
      id: String(populatedAlumna?._id ?? rutina.alumnaId),
      nombre: resolveAlumnaNombre(rutina.alumnaId),
      adherencia: roundOneDecimal(adherencia),
    });
  }

  items.sort((a, b) => a.adherencia - b.adherencia);
  return items.slice(0, 6);
}

async function buildActividadReciente() {
  const items: ActivityItem[] = [];

  const progresos = await RutinaProgreso.find({ diaCompletado: true })
    .sort({ updatedAt: -1 })
    .limit(8)
    .populate("alumnaId", "nombre")
    .select("alumnaId nombreDia updatedAt");

  for (const progreso of progresos) {
    const nombre = resolveAlumnaNombre(progreso.alumnaId);
    items.push({
      id: `progreso-${progreso._id.toString()}`,
      tipo: "rutina_completada",
      titulo: `${nombre} completó ${progreso.nombreDia}`,
      ocurrioEn: progreso.updatedAt ?? new Date(),
    });
  }

  const admisiones = await Usuario.find({
    ...ADMITTED_ALUMNA_FILTER,
    fechaAdmision: { $exists: true },
  })
    .sort({ fechaAdmision: -1 })
    .limit(8)
    .select("nombre fechaAdmision");

  for (const alumna of admisiones) {
    if (!alumna.fechaAdmision) continue;
    items.push({
      id: `admision-${alumna._id.toString()}`,
      tipo: "admision",
      titulo: `Nueva alumna admitida: ${alumna.nombre}`,
      ocurrioEn: alumna.fechaAdmision,
    });
  }

  const logs = await LogPeso.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("alumnaId", "nombre")
    .select("alumnaId createdAt");

  for (const log of logs) {
    const nombre = resolveAlumnaNombre(log.alumnaId);
    items.push({
      id: `peso-${log._id.toString()}`,
      tipo: "registro_peso",
      titulo: `Nuevo registro de peso de ${nombre}`,
      ocurrioEn: log.createdAt ?? new Date(),
    });
  }

  return items
    .sort((a, b) => b.ocurrioEn.getTime() - a.ocurrioEn.getTime())
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      tipo: item.tipo,
      titulo: item.titulo,
      ocurrioEn: item.ocurrioEn.toISOString(),
    }));
}

async function buildProximasCitas() {
  const today = startOfDay(new Date());
  const limit = addDays(today, 14);

  const rutinas = await Rutina.find({
    startDate: { $gte: today, $lte: limit },
  })
    .sort({ startDate: 1 })
    .limit(6)
    .populate("alumnaId", "nombre")
    .select("startDate alumnaId");

  return rutinas.map((rutina) => {
    const nombre = resolveAlumnaNombre(rutina.alumnaId);
    const fecha = rutina.startDate ?? today;
    return {
      id: rutina._id.toString(),
      titulo: `Inicio de plan con ${nombre}`,
      fechaHora: fecha.toISOString(),
    };
  });
}

async function buildProgresoSemanal() {
  const today = startOfDay(new Date());
  const weekStart = addDays(today, -6);

  const progresos = await RutinaProgreso.find({
    diaCompletado: true,
    updatedAt: { $gte: weekStart },
  }).select("updatedAt");

  const dayOrder = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
  const counts = new Map<string, number>(
    dayOrder.map((dia) => [dia, 0]),
  );

  for (const progreso of progresos) {
    const when = progreso.updatedAt ?? new Date();
    const label = weekdayLabelFromDate(when);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return dayOrder.map((dia) => ({
    dia,
    completados: counts.get(dia) ?? 0,
  }));
}

async function buildDistribucionPlanes() {
  const rutinas = await Rutina.find().select("planTemplateSnapshot");
  const total = rutinas.length;

  if (total === 0) return [];

  const groups = new Map<string, number>();

  for (const rutina of rutinas) {
    const nombre =
      rutina.planTemplateSnapshot?.formato?.trim() ||
      rutina.planTemplateSnapshot?.nombre?.trim() ||
      "Sin plan";
    groups.set(nombre, (groups.get(nombre) ?? 0) + 1);
  }

  return Array.from(groups.entries())
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: roundOneDecimal((cantidad / total) * 100),
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

export const panelService = {
  async getCola() {
    const todayKey = isoDateLabel(new Date());

    const admitted = await Usuario.find(ADMITTED_ALUMNA_FILTER)
      .select("_id nombre membresia")
      .lean();
    const admittedIds = admitted.map((a) => a._id);

    const [
      admisionesPendientes,
      rutinas,
      evaluaciones,
      planesPublicados,
      checkinsHoy,
      alumnasAtencion,
    ] = await Promise.all([
      Usuario.find({ rol: "alumna", estadoAdmision: "pendiente" })
        .select("_id nombre correo")
        .lean(),
      Rutina.find({ alumnaId: { $in: admittedIds } }).select("alumnaId").lean(),
      EvaluacionNutricional.find({
        alumnaId: { $in: admittedIds },
        completada: true,
      })
        .select("alumnaId")
        .lean(),
      PlanNutricional.find({
        alumnaId: { $in: admittedIds },
        estado: "publicado",
      })
        .select("alumnaId")
        .lean(),
      CheckinAlimentacion.find({
        dateKey: todayKey,
        estado: { $in: ["no_pude", "parcial"] },
        alumnaId: { $in: admittedIds },
      })
        .select("alumnaId estado")
        .lean(),
      buildAlumnasAtencion(),
    ]);

    const conRutina = new Set(rutinas.map((r) => String(r.alumnaId)));
    const conEval = new Set(evaluaciones.map((e) => String(e.alumnaId)));
    const conPlan = new Set(planesPublicados.map((p) => String(p.alumnaId)));

    const sinRutina = admitted
      .filter((a) => !conRutina.has(String(a._id)))
      .map((a) => ({ id: String(a._id), nombre: a.nombre }));

    const evalSinPlan = admitted
      .filter(
        (a) =>
          conEval.has(String(a._id)) && !conPlan.has(String(a._id)),
      )
      .map((a) => ({ id: String(a._id), nombre: a.nombre }));

    const checkinsAtencion = checkinsHoy.map((c) => {
      const alumna = admitted.find((a) => String(a._id) === String(c.alumnaId));
      return {
        id: String(c.alumnaId),
        nombre: alumna?.nombre ?? "Alumna",
        estado: c.estado as string,
      };
    });

    const membresiasPorVencer = admitted
      .filter((a) => a.membresia?.estado === "por_vencer")
      .map((a) => ({
        id: String(a._id),
        nombre: a.nombre,
        fechaVencimiento: a.membresia?.fechaVencimiento ?? null,
      }));

    const membresiasVencidas = admitted
      .filter((a) => a.membresia?.estado === "vencida")
      .map((a) => ({
        id: String(a._id),
        nombre: a.nombre,
        fechaVencimiento: a.membresia?.fechaVencimiento ?? null,
      }));

    return {
      counts: {
        admisionesPendientes: admisionesPendientes.length,
        sinRutina: sinRutina.length,
        evalSinPlan: evalSinPlan.length,
        checkinsAtencion: checkinsAtencion.length,
        adherenciaBaja: alumnasAtencion.length,
        membresiasPorVencer: membresiasPorVencer.length,
        membresiasVencidas: membresiasVencidas.length,
      },
      admisionesPendientes: admisionesPendientes.map((a) => ({
        id: String(a._id),
        nombre: a.nombre,
        correo: a.correo,
      })),
      sinRutina,
      evalSinPlan,
      checkinsAtencion,
      adherenciaBaja: alumnasAtencion,
      membresiasPorVencer,
      membresiasVencidas,
    };
  },

  async getDashboard() {
    const [
      alumnasActivas,
      entrenamientosPlanificados,
      satisfaccionPromedio,
      tendencias,
      actividadReciente,
      proximasCitas,
      progresoSemanal,
      progreso30d,
      distribucionPlanes,
      alumnasAtencion,
      cola,
    ] = await Promise.all([
      countAlumnasActivas(),
      countEntrenamientosPlanificados(),
      calcularSatisfaccionPromedio(),
      buildTendencias(),
      buildActividadReciente(),
      buildProximasCitas(),
      buildProgresoSemanal(),
      buildProgreso30d(),
      buildDistribucionPlanes(),
      buildAlumnasAtencion(),
      panelService.getCola(),
    ]);

    return {
      metricas: {
        alumnasActivas,
        entrenamientosPlanificados,
        ingresosMes: tendencias.ingresosMes,
        satisfaccionPromedio,
      },
      tendencias: {
        alumnasNuevas: tendencias.alumnasNuevas,
        alumnasNuevasDelta: tendencias.alumnasNuevasDelta,
        ingresosDelta: tendencias.ingresosDelta,
        entrenamientosDelta: tendencias.entrenamientosDelta,
      },
      actividadReciente,
      proximasCitas,
      progresoSemanal,
      progreso30d,
      distribucionPlanes,
      alumnasAtencion,
      cola: {
        counts: cola.counts,
      },
    };
  },
};
