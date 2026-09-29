import {
  CheckinAlimentacion,
  ConversacionAsistente,
  EvaluacionNutricional,
  GamificacionEvento,
  LogPeso,
  Medicion,
  RutinaProgreso,
  Usuario,
  type ConversacionAsistenteDocument,
  type UsuarioDocument,
} from "@ivisfit/database";
import {
  BADGE_CATEGORIAS,
  BADGES_CATALOGO,
} from "./gamificacion-badges.catalog.js";
import {
  badgeCumplido,
  progresoBadge,
  tieneDiaCompleto,
  tieneSemanaEquilibrada,
  type BadgeContext,
} from "./gamificacion-badges.logic.js";

export { BADGES_CATALOGO } from "./gamificacion-badges.catalog.js";

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

const MEDICION_PLIEGUES_OR = [
  { "pliegues.tricipital": { $ne: null } },
  { "pliegues.suprailiaco": { $ne: null } },
  { "pliegues.pectoral": { $ne: null } },
  { "pliegues.abdominal": { $ne: null } },
  { "pliegues.muslo": { $ne: null } },
];

const MEDICION_CIRCUNFERENCIAS_OR = [
  { "circunferencias.cuelloCm": { $ne: null } },
  { "circunferencias.cinturaCm": { $ne: null } },
  { "circunferencias.caderaCm": { $ne: null } },
];

async function buildBadgeContext(
  alumnaId: string,
  usuario: UsuarioDocument,
  progresos: Array<{ dateKey: string }>,
  totalDias: number,
  rachaMaxima: number,
  nivel: number,
): Promise<BadgeContext> {
  const [
    totalCheckins,
    checkinsDocs,
    totalMediciones,
    totalMedicionesPliegues,
    totalMedicionesCircunferencias,
    totalLogsPesos,
    ejerciciosDistintos,
    tieneEvaluacion,
    conversacion,
  ] = await Promise.all([
    CheckinAlimentacion.countDocuments({ alumnaId }),
    CheckinAlimentacion.find({
      alumnaId,
      estado: { $in: ["cumpli", "parcial"] },
    })
      .select("dateKey estado")
      .lean(),
    Medicion.countDocuments({ alumnaId }),
    Medicion.countDocuments({ alumnaId, $or: MEDICION_PLIEGUES_OR }),
    Medicion.countDocuments({ alumnaId, $or: MEDICION_CIRCUNFERENCIAS_OR }),
    LogPeso.countDocuments({ alumnaId }),
    LogPeso.distinct("ejercicioId", { alumnaId }),
    EvaluacionNutricional.exists({ alumnaId }),
    ConversacionAsistente.findOne({ alumnaId })
      .select("mensajes ultimoCheckin")
      .lean<Pick<ConversacionAsistenteDocument, "mensajes" | "ultimoCheckin">>(),
  ]);

  const checkinValidosKeys = checkinsDocs.map((c) => c.dateKey);
  const { rachaMaxima: rachaAlimentacionMaxima } =
    computeRacha(checkinValidosKeys);
  const totalCheckinsCumpli = checkinsDocs.filter(
    (c) => c.estado === "cumpli",
  ).length;
  const entrenamientoKeys = progresos.map((p) => p.dateKey);

  const mensajesAsistenteUsuario =
    conversacion?.mensajes?.filter((m) => m.role === "user").length ?? 0;

  return {
    totalDias,
    rachaMaxima,
    totalCheckins,
    totalCheckinsValidos: checkinsDocs.length,
    totalCheckinsCumpli,
    rachaAlimentacionMaxima,
    totalMediciones,
    totalMedicionesPliegues,
    totalMedicionesCircunferencias,
    totalLogsPesos,
    ejerciciosConPesoDistintos: ejerciciosDistintos.length,
    nivel,
    tieneEvaluacion: Boolean(tieneEvaluacion),
    tieneFotoPerfil: Boolean(usuario.fotoPerfil?.url),
    onboardingCompletado: Boolean(usuario.onboarding?.completado),
    mensajesAsistenteUsuario,
    tieneCheckinAsistente: Boolean(conversacion?.ultimoCheckin?.dateKey),
    tieneDiaCompleto: tieneDiaCompleto(entrenamientoKeys, checkinValidosKeys),
    tieneSemanaEquilibrada: tieneSemanaEquilibrada(
      entrenamientoKeys,
      checkinValidosKeys,
    ),
  };
}

function ordenProximosLogros<T extends { codigo: string; desbloqueado: boolean }>(
  badges: T[],
  ctx: BadgeContext,
): T[] {
  const bloqueados = badges.filter((b) => !b.desbloqueado);
  const withIndex = bloqueados.map((badge, catalogIndex) => {
    const prog = progresoBadge(
      badge.codigo as (typeof BADGES_CATALOGO)[number]["codigo"],
      ctx,
    );
    const ratio =
      prog && prog.objetivo > 0
        ? Math.min(1, prog.actual / prog.objetivo)
        : 0;
    return { badge, ratio, catalogIndex };
  });
  withIndex.sort((a, b) => {
    if (b.ratio !== a.ratio) return b.ratio - a.ratio;
    return a.catalogIndex - b.catalogIndex;
  });
  return withIndex.map((item) => item.badge);
}

function resumenCategorias(
  badges: Array<{ categoria: string; desbloqueado: boolean }>,
) {
  const totals = new Map<string, { total: number; desbloqueados: number }>();
  for (const badge of badges) {
    const current = totals.get(badge.categoria) ?? {
      total: 0,
      desbloqueados: 0,
    };
    current.total += 1;
    if (badge.desbloqueado) current.desbloqueados += 1;
    totals.set(badge.categoria, current);
  }
  return (Object.keys(BADGE_CATEGORIAS) as (keyof typeof BADGE_CATEGORIAS)[]).map(
    (id) => ({
      id,
      label: BADGE_CATEGORIAS[id],
      total: totals.get(id)?.total ?? 0,
      desbloqueados: totals.get(id)?.desbloqueados ?? 0,
    }),
  );
}

async function recalcular(alumnaId: string) {
  const [usuario, progresos, totalDias, eventos] = await Promise.all([
    Usuario.findById(alumnaId),
    RutinaProgreso.find({ alumnaId, diaCompletado: true })
      .select("dateKey")
      .lean(),
    RutinaProgreso.countDocuments({ alumnaId, diaCompletado: true }),
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
  const ctx = await buildBadgeContext(
    alumnaId,
    usuario as UsuarioDocument,
    progresos as unknown as Array<{ dateKey: string }>,
    totalDias,
    rachaMaxima,
    nivel,
  );

  const badges = [...(usuario.gamificacion?.badges ?? [])];
  const badgesExistentes = badges.map((badge) => badge.codigo);
  const nuevosBadges = BADGES_CATALOGO.filter(
    (badge) =>
      !badgesExistentes.includes(badge.codigo) &&
      badgeCumplido(badge.codigo, ctx),
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
    badgeContext: ctx,
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
    const recalc = await recalcular(alumnaId);

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
      gamificacion.badges =
        (usuario.gamificacion.badges as unknown as BadgeGuardado[] | undefined) ??
        [];
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

    let ctx = recalc?.badgeContext;
    if (!ctx && usuario) {
      const progresos = await RutinaProgreso.find({
        alumnaId,
        diaCompletado: true,
      })
        .select("dateKey")
        .lean();
      const totalDias = progresos.length;
      ctx = await buildBadgeContext(
        alumnaId,
        usuario as UsuarioDocument,
        progresos as unknown as Array<{ dateKey: string }>,
        totalDias,
        gamificacion.rachaMaxima,
        nivel,
      );
    }

    const proximosLogros = ctx
      ? ordenProximosLogros(badges, ctx).slice(0, 3)
      : badges.filter((badge) => !badge.desbloqueado).slice(0, 3);

    return {
      xpTotal,
      nivel,
      xpProgresoNivel,
      xpSiguiente,
      rachaActual: gamificacion.rachaActual ?? 0,
      rachaMaxima: gamificacion.rachaMaxima ?? 0,
      badges,
      categorias: resumenCategorias(badges),
      proximosLogros,
      eventosRecientes,
    };
  },
};
