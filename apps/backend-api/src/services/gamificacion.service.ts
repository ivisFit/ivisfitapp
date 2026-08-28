import {
  CheckinAlimentacion,
  GamificacionEvento,
  LogPeso,
  Medicion,
  RutinaProgreso,
  Usuario,
} from "@ivisfit/database";

export const GAMIFICACION_EVENTOS = {
  entrenamiento: { puntos: 10, descripcion: "Día de entrenamiento completado" },
  checkin_alimentacion: { puntos: 5, descripcion: "Check-in de alimentación" },
  medicion: { puntos: 15, descripcion: "Medición registrada" },
  peso: { puntos: 5, descripcion: "Carga de peso registrada" },
  racha_3: { puntos: 15, descripcion: "Racha de 3 días" },
  racha_7: { puntos: 30, descripcion: "Racha de 7 días" },
  racha_14: { puntos: 60, descripcion: "Racha de 14 días" },
  racha_28: { puntos: 100, descripcion: "Racha de 28 días" },
  desafio: { puntos: 100, descripcion: "Desafío de 28 días completado" },
} as const;

const RACHAS_BONUS: Array<{
  dias: number;
  tipo: keyof typeof GAMIFICACION_EVENTOS;
  referencia: string;
}> = [
  { dias: 3, tipo: "racha_3", referencia: "racha-3" },
  { dias: 7, tipo: "racha_7", referencia: "racha-7" },
  { dias: 14, tipo: "racha_14", referencia: "racha-14" },
  { dias: 28, tipo: "racha_28", referencia: "racha-28" },
];

export const BADGES_CATALOGO = [
  {
    codigo: "primer_entrenamiento",
    nombre: "Primer paso",
    descripcion: "Completaste tu primer día de entrenamiento",
    icono: "🏋️",
  },
  {
    codigo: "racha_3",
    nombre: "Racha de 3",
    descripcion: "3 días seguidos entrenando",
    icono: "🔥",
  },
  {
    codigo: "racha_7",
    nombre: "Una semana",
    descripcion: "7 días seguidos entrenando",
    icono: "🔥",
  },
  {
    codigo: "racha_14",
    nombre: "Dos semanas",
    descripcion: "14 días seguidos entrenando",
    icono: "🔥",
  },
  {
    codigo: "racha_28",
    nombre: "Acero",
    descripcion: "28 días seguidos entrenando",
    icono: "💪",
  },
  {
    codigo: "desafio_completado",
    nombre: "Desafío cumplido",
    descripcion: "Completaste tu desafío de 28 días",
    icono: "🏆",
  },
  {
    codigo: "primer_checkin",
    nombre: "Primer check-in",
    descripcion: "Registraste tu alimentación por primera vez",
    icono: "🍽️",
  },
  {
    codigo: "checkin_semana",
    nombre: "Constancia alimentaria",
    descripcion: "7 check-ins de alimentación",
    icono: "🥗",
  },
  {
    codigo: "primera_medicion",
    nombre: "Midiendo el progreso",
    descripcion: "Registraste tu primera medición",
    icono: "📏",
  },
  {
    codigo: "peso_logueado",
    nombre: "Cargando fuerza",
    descripcion: "Registraste tu primer peso de ejercicio",
    icono: "🎯",
  },
  {
    codigo: "nivel_5",
    nombre: "Nivel 5",
    descripcion: "Alcanzaste el nivel 5",
    icono: "⭐",
  },
  {
    codigo: "nivel_10",
    nombre: "Nivel 10",
    descripcion: "Alcanzaste el nivel 10",
    icono: "🌟",
  },
] as const;

export type BadgeCodigo = (typeof BADGES_CATALOGO)[number]["codigo"];

const XP_BASE_NIVEL = 100;

function xpBaseNivel(nivel: number): number {
  return XP_BASE_NIVEL * Math.pow(nivel - 1, 2);
}

export function nivelPorXp(xpTotal: number): number {
  return Math.floor(Math.sqrt(xpTotal / XP_BASE_NIVEL)) + 1;
}

function getTodayDateKey(timeZone = "America/Montevideo"): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function shiftDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function computeRacha(dateKeys: string[]): {
  rachaActual: number;
  rachaMaxima: number;
} {
  const set = new Set(dateKeys);
  const sorted = [...new Set(dateKeys)].sort();

  let rachaMaxima = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of sorted) {
    if (prev === null) {
      run = 1;
    } else {
      const prevDate = new Date(`${prev}T00:00:00Z`);
      const currDate = new Date(`${key}T00:00:00Z`);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / 86400000;
      run = diffDays === 1 ? run + 1 : 1;
    }
    if (run > rachaMaxima) rachaMaxima = run;
    prev = key;
  }

  const today = getTodayDateKey();
  let cursor = set.has(today) ? today : shiftDateKey(today, -1);
  let rachaActual = 0;
  while (set.has(cursor)) {
    rachaActual += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return { rachaActual, rachaMaxima };
}

interface BadgeContext {
  totalDias: number;
  rachaMaxima: number;
  totalCheckins: number;
  totalMediciones: number;
  totalLogsPesos: number;
  nivel: number;
}

function badgeCumplido(
  codigo: BadgeCodigo,
  ctx: BadgeContext,
): boolean {
  switch (codigo) {
    case "primer_entrenamiento":
      return ctx.totalDias >= 1;
    case "racha_3":
      return ctx.rachaMaxima >= 3;
    case "racha_7":
      return ctx.rachaMaxima >= 7;
    case "racha_14":
      return ctx.rachaMaxima >= 14;
    case "racha_28":
      return ctx.rachaMaxima >= 28;
    case "desafio_completado":
      return ctx.totalDias >= 28;
    case "primer_checkin":
      return ctx.totalCheckins >= 1;
    case "checkin_semana":
      return ctx.totalCheckins >= 7;
    case "primera_medicion":
      return ctx.totalMediciones >= 1;
    case "peso_logueado":
      return ctx.totalLogsPesos >= 1;
    case "nivel_5":
      return ctx.nivel >= 5;
    case "nivel_10":
      return ctx.nivel >= 10;
    default:
      return false;
  }
}

async function recalcular(alumnaId: string) {
  const [
    usuario,
    progresos,
    totalDias,
    totalCheckins,
    totalMediciones,
    totalLogsPesos,
    eventos,
  ] = await Promise.all([
    Usuario.findById(alumnaId),
    RutinaProgreso.find({ alumnaId, diaCompletado: true })
      .select("dateKey")
      .lean(),
    RutinaProgreso.countDocuments({ alumnaId, diaCompletado: true }),
    CheckinAlimentacion.countDocuments({ alumnaId }),
    Medicion.countDocuments({ alumnaId }),
    LogPeso.countDocuments({ alumnaId }),
    GamificacionEvento.find({ alumnaId }).lean(),
  ]);

  if (!usuario) return null;

  const { rachaActual, rachaMaxima } = computeRacha(
    progresos.map((progreso) => progreso.dateKey),
  );

  let xpTotal = usuario.gamificacion?.xpTotal ?? 0;
  const hasEvent = (tipo: string, referencia: string) =>
    eventos.some(
      (evento) => evento.tipo === tipo && evento.referencia === referencia,
    );

  const bonuses: Array<{
    tipo: string;
    referencia: string;
    puntos: number;
    descripcion: string;
  }> = [];

  for (const racha of RACHAS_BONUS) {
    if (rachaMaxima >= racha.dias && !hasEvent(racha.tipo, racha.referencia)) {
      bonuses.push({
        tipo: racha.tipo,
        referencia: racha.referencia,
        puntos: GAMIFICACION_EVENTOS[racha.tipo].puntos,
        descripcion: GAMIFICACION_EVENTOS[racha.tipo].descripcion,
      });
    }
  }

  if (totalDias >= 28 && !hasEvent("desafio", "desafio-28")) {
    bonuses.push({
      tipo: "desafio",
      referencia: "desafio-28",
      puntos: GAMIFICACION_EVENTOS.desafio.puntos,
      descripcion: GAMIFICACION_EVENTOS.desafio.descripcion,
    });
  }

  for (const bonus of bonuses) {
    await GamificacionEvento.create({
      alumnaId,
      tipo: bonus.tipo,
      puntos: bonus.puntos,
      descripcion: bonus.descripcion,
      referencia: bonus.referencia,
    });
    xpTotal += bonus.puntos;
  }

  const nivel = nivelPorXp(xpTotal);
  const badges = [...(usuario.gamificacion?.badges ?? [])];
  const badgesExistentes = badges.map((badge) => badge.codigo);
  const nuevosBadges = BADGES_CATALOGO.filter(
    (badge) =>
      !badgesExistentes.includes(badge.codigo) &&
      badgeCumplido(badge.codigo, {
        totalDias,
        rachaMaxima,
        totalCheckins,
        totalMediciones,
        totalLogsPesos,
        nivel,
      }),
  );

  for (const badge of nuevosBadges) {
    badges.push({
      codigo: badge.codigo,
      desbloqueadoAt: new Date(),
    });
    await GamificacionEvento.create({
      alumnaId,
      tipo: "logro",
      puntos: 0,
      descripcion: `Logro desbloqueado: ${badge.nombre}`,
      referencia: badge.codigo,
    });
  }

  usuario.gamificacion = {
    xpTotal,
    nivel,
    rachaActual,
    rachaMaxima,
    badges,
  };
  await usuario.save();

  return {
    xpTotal,
    nivel,
    rachaActual,
    rachaMaxima,
    badgesNuevos: nuevosBadges.map((badge) => badge.codigo),
  };
}

export const gamificacionService = {
  async procesarEvento(
    alumnaId: string,
    tipo: keyof typeof GAMIFICACION_EVENTOS | "logro",
    options?: { puntos?: number; descripcion?: string; referencia?: string },
  ) {
    try {
      const config =
        tipo === "logro"
          ? { puntos: 0, descripcion: options?.descripcion ?? "" }
          : GAMIFICACION_EVENTOS[tipo];
      const puntos = options?.puntos ?? config.puntos;
      const descripcion = options?.descripcion ?? config.descripcion;
      const referencia = options?.referencia;

      if (referencia) {
        const yaExiste = await GamificacionEvento.exists({
          alumnaId,
          tipo,
          referencia,
        });
        if (yaExiste) {
          await recalcular(alumnaId);
          return;
        }
      }

      if (puntos > 0) {
        await GamificacionEvento.create({
          alumnaId,
          tipo,
          puntos,
          descripcion,
          referencia,
        });
        await Usuario.updateOne(
          { _id: alumnaId },
          { $inc: { "gamificacion.xpTotal": puntos } },
        );
      }

      await recalcular(alumnaId);
    } catch (error) {
      console.error(
        `[gamificacion] Error procesando evento ${tipo} para ${alumnaId}:`,
        error,
      );
    }
  },

  async getPerfil(alumnaId: string) {
    await recalcular(alumnaId);

    type BadgeGuardado = { codigo: string; desbloqueadoAt?: Date };
    const gamificacion: {
      xpTotal: number;
      nivel: number;
      rachaActual: number;
      rachaMaxima: number;
      badges: BadgeGuardado[];
    } = { xpTotal: 0, nivel: 1, rachaActual: 0, rachaMaxima: 0, badges: [] };

    const usuario = await Usuario.findById(alumnaId);
    if (usuario?.gamificacion) {
      gamificacion.xpTotal = usuario.gamificacion.xpTotal ?? 0;
      gamificacion.nivel = usuario.gamificacion.nivel ?? 1;
      gamificacion.rachaActual = usuario.gamificacion.rachaActual ?? 0;
      gamificacion.rachaMaxima = usuario.gamificacion.rachaMaxima ?? 0;
      gamificacion.badges = (
        usuario.gamificacion.badges as unknown as BadgeGuardado[] | undefined
      ) ?? [];
    }

    const xpTotal = gamificacion.xpTotal;
    const nivel = gamificacion.nivel ?? nivelPorXp(xpTotal);
    const base = xpBaseNivel(nivel);
    const xpSiguiente = XP_BASE_NIVEL * (2 * nivel - 1);
    const xpProgresoNivel = xpTotal - base;

    const eventosRecientes = await GamificacionEvento.find({ alumnaId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("tipo puntos descripcion createdAt")
      .lean();

    const desbloqueadas = new Set(
      (gamificacion.badges ?? []).map((badge) => badge.codigo),
    );
    const badges = BADGES_CATALOGO.map((badge) => {
      const desbloqueado = desbloqueadas.has(badge.codigo);
      const unlock = (gamificacion.badges ?? []).find(
        (item) => item.codigo === badge.codigo,
      );
      return {
        ...badge,
        desbloqueado,
        desbloqueadoAt: desbloqueado ? unlock?.desbloqueadoAt : undefined,
      };
    });

    return {
      xpTotal,
      nivel,
      xpProgresoNivel,
      xpSiguiente,
      rachaActual: gamificacion.rachaActual ?? 0,
      rachaMaxima: gamificacion.rachaMaxima ?? 0,
      badges,
      proximosLogros: badges.filter((badge) => !badge.desbloqueado).slice(0, 3),
      eventosRecientes,
    };
  },
};
