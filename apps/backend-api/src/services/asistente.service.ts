import {
  ConversacionAsistente,
  CoachInsight,
  Ejercicio,
  EvaluacionNutricional,
  Medicion,
  PlanNutricional,
  Rutina,
  RutinaProgreso,
  Usuario,
  type AsistenteCheckinMotivo,
  type AsistenteCheckinRating,
} from "@ivisfit/database";
import {
  assistantGeminiService,
  detectEscalation,
  ESCALATION_REPLY,
} from "./assistant-gemini.service.js";
import { coachProgresoService } from "./coach-progreso.service.js";
import { rutinaProgresoService } from "./rutina-progreso.service.js";
import {
  buildWhatsAppComunidadHref,
  buildWhatsAppIvisHref,
} from "../lib/whatsapp.js";

const MAX_MENSAJES_GUARDADOS = 40;
const TIME_ZONE = "America/Montevideo";

const RATING_LABELS: Record<AsistenteCheckinRating, string> = {
  excelente: "Excelente",
  bien: "Bien",
  mas_o_menos: "Más o menos",
  no_entrene: "No entrené",
};

const MOTIVO_LABELS: Record<AsistenteCheckinMotivo, string> = {
  sin_tiempo: "No tuve tiempo",
  sin_ganas: "No tenía ganas",
  dolor: "Dolor",
  mucho_trabajo: "Mucho trabajo",
  olvido: "Olvido",
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

type MensajeConversacion = {
  role: "user" | "assistant";
  content: string;
  escalated?: boolean;
  fecha?: Date;
};

function getMensajesDelDia(
  conversacion: { mensajes?: MensajeConversacion[]; historialDateKey?: string } | null,
  today: string,
): MensajeConversacion[] {
  if (!conversacion?.mensajes?.length) return [];
  if (conversacion.historialDateKey === today) return conversacion.mensajes;
  return [];
}

function buildCheckinReply(
  rating: AsistenteCheckinRating,
  motivo?: AsistenteCheckinMotivo,
): { reply: string; escalated: boolean; needsMotivo: boolean } {
  if (rating === "no_entrene" && !motivo) {
    return {
      reply: "¿Qué pasó? Contame un poquito para ayudarte mejor.",
      escalated: false,
      needsMotivo: true,
    };
  }

  if (motivo === "dolor") {
    return { reply: ESCALATION_REPLY, escalated: true, needsMotivo: false };
  }

  if (rating === "excelente") {
    return {
      reply:
        "¡Qué bueno escucharlo! 💪 Ese tipo de días construyen constancia. ¿Querés que repasemos algo de tu rutina o tu alimentación?",
      escalated: false,
      needsMotivo: false,
    };
  }

  if (rating === "bien") {
    return {
      reply:
        "Me alegra que hayas entrenado. Ir bien también cuenta. ¿Hay algo que quieras ajustar para la próxima?",
      escalated: false,
      needsMotivo: false,
    };
  }

  if (rating === "mas_o_menos") {
    return {
      reply:
        "Está bien sentirlo así. No todos los entrenamientos tienen que ser perfectos. ¿Qué te costó más hoy?",
      escalated: false,
      needsMotivo: false,
    };
  }

  switch (motivo) {
    case "sin_tiempo":
      return {
        reply:
          "Pasa mucho. Cuando el día se complica, a veces alcanza con 15–20 minutos. ¿Querés que te arme una idea corta para hoy?",
        escalated: false,
        needsMotivo: false,
      };
    case "sin_ganas":
      return {
        reply:
          "Es totalmente normal tener días así. No necesitás una rutina perfecta. ¿Qué te parece si hoy hacés solamente el calentamiento?",
        escalated: false,
        needsMotivo: false,
      };
    case "mucho_trabajo":
      return {
        reply:
          "Cuando el trabajo pesa, el cuerpo también lo siente. Si podés, priorizá dormir y mañana vemos un entrenamiento corto. Estoy acá.",
        escalated: false,
        needsMotivo: false,
      };
    case "olvido":
      return {
        reply:
          "Pasa. Lo importante es volver sin culpa. ¿Querés que te recuerde mirar tu rutina más temprano mañana?",
        escalated: false,
        needsMotivo: false,
      };
    default:
      return {
        reply: "Gracias por contarme. Estoy acá para lo que necesites hoy.",
        escalated: false,
        needsMotivo: false,
      };
  }
}

async function buildContext(alumnaId: string) {
  const [usuario, evaluacion, plan, rutina, ultimaMedicion, comunidadHoy] =
    await Promise.all([
      Usuario.findById(alumnaId).select("nombre alergias lesionesPatologias"),
      EvaluacionNutricional.findOne({ alumnaId, completada: true }),
      PlanNutricional.findOne({ alumnaId, estado: "publicado" }).sort({ publicadoAt: -1 }),
      Rutina.findOne({ alumnaId }).sort({ createdAt: -1 }),
      Medicion.findOne({ alumnaId }).sort({ fecha: -1 }).select("pesoCorporalKg fecha"),
      RutinaProgreso.countDocuments({
        dateKey: getTodayDateKey(),
        diaCompletado: true,
      }),
    ]);

  let rutinaResumen: string | undefined;
  let cumplimientoResumen: string | undefined;
  let ejerciciosResumen: string | undefined;
  let logrosResumen: string | undefined;

  if (rutina) {
    const diasPorSemana = rutina.semanas[0]?.dias.length ?? 0;
    rutinaResumen = `${rutina.nombrePlan} (${rutina.duracionSemanas} semanas, ${diasPorSemana} días de entrenamiento por semana)`;

    const ids = new Set<string>();
    for (const semana of rutina.semanas) {
      for (const dia of semana.dias) {
        for (const ejercicio of dia.ejercicios) {
          ids.add(String(ejercicio.ejercicioId));
        }
      }
    }

    if (ids.size > 0) {
      const ejercicios = await Ejercicio.find({ _id: { $in: [...ids] } })
        .select("nombre")
        .limit(40);
      const nombres = ejercicios.map((e) => e.nombre).filter(Boolean);
      if (nombres.length) {
        ejerciciosResumen = nombres.slice(0, 25).join(", ");
      }
    }

    const progreso = await rutinaProgresoService.list({
      alumnaId,
      rutinaId: rutina._id.toString(),
    });
    const completados = progreso.filter((registro) => registro.diaCompletado);

    if (diasPorSemana > 0) {
      const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const completadosUltimaSemana = completados.filter(
        (registro) =>
          registro.updatedAt &&
          new Date(registro.updatedAt) >= haceUnaSemana,
      ).length;
      const porcentaje = Math.min(
        100,
        Math.round((completadosUltimaSemana / diasPorSemana) * 100),
      );
      cumplimientoResumen = `${completadosUltimaSemana} de ${diasPorSemana} días completados en los últimos 7 días (${porcentaje}%)`;
    }

    const totalCompletados = completados.length;
    const sortedKeys = completados
      .map((r) => r.dateKey)
      .filter(Boolean)
      .sort();
    let semanasConstantes = 0;
    if (sortedKeys.length > 0) {
      const first = new Date(`${sortedKeys[0]}T00:00:00`);
      const last = new Date(`${sortedKeys[sortedKeys.length - 1]}T00:00:00`);
      semanasConstantes = Math.max(
        1,
        Math.round((last.getTime() - first.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1,
      );
    }
    if (totalCompletados > 0) {
      logrosResumen = `${totalCompletados} entrenamientos completados; aproximadamente ${semanasConstantes} semanas en el plan`;
    }
  }

  let planNutricionalResumen: string | undefined;
  if (plan) {
    const { kcal, proteinaG, carbohidratosG, grasasG } = plan.macrosObjetivo;
    planNutricionalResumen = `"${plan.titulo}", objetivo diario ${kcal} kcal (proteína ${proteinaG}g, carbohidratos ${carbohidratosG}g, grasas ${grasasG}g)`;
  }

  const restricciones = [
    ...(evaluacion?.restricciones ?? []),
    ...(evaluacion?.alergias ?? []),
    ...(usuario?.alergias ? [usuario.alergias] : []),
    ...(usuario?.lesionesPatologias ? [usuario.lesionesPatologias] : []),
  ];

  let pesoResumen: string | undefined;
  if (ultimaMedicion?.pesoCorporalKg) {
    const fecha = new Date(ultimaMedicion.fecha as unknown as Date).toLocaleDateString("es-UY");
    pesoResumen = `${ultimaMedicion.pesoCorporalKg} kg (última medición: ${fecha})`;
  }

  return {
    nombre: usuario?.nombre,
    objetivo: evaluacion?.objetivo,
    restricciones: restricciones.length ? restricciones : undefined,
    rutinaResumen,
    ejerciciosResumen,
    cumplimientoResumen,
    logrosResumen,
    planNutricionalResumen,
    pesoResumen,
    comunidadHoy,
  };
}

async function appendConversation(
  alumnaId: string,
  userContent: string,
  assistantContent: string,
  escalated: boolean,
  extra?: { ultimoCheckin?: { dateKey: string; rating: string; motivo?: string } },
) {
  const today = getTodayDateKey();
  const conversacion = await ConversacionAsistente.findOne({ alumnaId });
  const mensajesBase = getMensajesDelDia(conversacion, today);
  const nuevosMensajes = [
    ...mensajesBase,
    { role: "user" as const, content: userContent, escalated, fecha: new Date() },
    {
      role: "assistant" as const,
      content: assistantContent,
      escalated: false,
      fecha: new Date(),
    },
  ].slice(-MAX_MENSAJES_GUARDADOS);

  const $set: Record<string, unknown> = {
    mensajes: nuevosMensajes,
    historialDateKey: today,
  };
  if (extra?.ultimoCheckin) {
    $set.ultimoCheckin = extra.ultimoCheckin;
  }

  await ConversacionAsistente.findOneAndUpdate(
    { alumnaId },
    { $set },
    { upsert: true, runValidators: true },
  );
}

export const asistenteService = {
  async bootstrap(alumnaId: string) {
    const today = getTodayDateKey();
    await coachProgresoService.evaluar(alumnaId);

    const [context, conversacion, insights] = await Promise.all([
      buildContext(alumnaId),
      ConversacionAsistente.findOne({ alumnaId }),
      CoachInsight.find({ alumnaId, leido: false }).sort({ createdAt: -1 }).limit(1),
    ]);

    const insight = insights[0];
    const checkinPendiente = conversacion?.ultimoCheckin?.dateKey !== today;
    const historial = getMensajesDelDia(conversacion, today);

    if (conversacion && conversacion.historialDateKey !== today) {
      await ConversacionAsistente.findOneAndUpdate(
        { alumnaId },
        { $set: { mensajes: [], historialDateKey: today } },
      );
    }

    return {
      historial,
      fechaHoy: today,
      checkinPendiente,
      comunidadHoy: context.comunidadHoy ?? 0,
      whatsappIvisHref: buildWhatsAppIvisHref(context.nombre),
      whatsappComunidadHref: buildWhatsAppComunidadHref(context.nombre),
      insightPendiente: insight
        ? { id: String(insight._id), mensaje: insight.mensaje }
        : undefined,
      nombre: context.nombre,
      logrosResumen: context.logrosResumen,
      cumplimientoResumen: context.cumplimientoResumen,
    };
  },

  async chat(
    alumnaId: string,
    mensaje: string,
    categoria?: string,
  ) {
    const escalated = detectEscalation(mensaje);

    const today = getTodayDateKey();
    const [context, conversacion] = await Promise.all([
      buildContext(alumnaId),
      ConversacionAsistente.findOne({ alumnaId }),
    ]);

    const history = getMensajesDelDia(conversacion, today).map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }),
    );

    const reply = await assistantGeminiService.chat(
      mensaje,
      context,
      escalated,
      history,
      categoria,
    );

    await appendConversation(alumnaId, mensaje, reply, escalated);

    const whatsappHref = escalated
      ? buildWhatsAppIvisHref(
          context.nombre,
          "me gustaría contarte algo importante",
        )
      : undefined;

    return { reply, escalated, whatsappHref, fechaHoy: today };
  },

  async checkin(
    alumnaId: string,
    rating: AsistenteCheckinRating,
    motivo?: AsistenteCheckinMotivo,
  ) {
    const today = getTodayDateKey();
    const { reply, escalated, needsMotivo } = buildCheckinReply(rating, motivo);

    if (needsMotivo) {
      const userLabel = RATING_LABELS[rating];
      await appendConversation(alumnaId, userLabel, reply, false);
      return {
        reply,
        escalated: false,
        needsMotivo: true,
        whatsappHref: undefined as string | undefined,
        fechaHoy: today,
      };
    }

    const userLabel = motivo
      ? `${RATING_LABELS[rating]} — ${MOTIVO_LABELS[motivo]}`
      : RATING_LABELS[rating];

    await appendConversation(alumnaId, userLabel, reply, escalated, {
      ultimoCheckin: {
        dateKey: today,
        rating,
        ...(motivo ? { motivo } : {}),
      },
    });

    const context = await buildContext(alumnaId);
    const whatsappHref = escalated
      ? buildWhatsAppIvisHref(context.nombre, "me duele y quiero que lo veamos juntas")
      : undefined;

    return { reply, escalated, needsMotivo: false, whatsappHref, fechaHoy: today };
  },

  async getHistory(alumnaId: string) {
    const today = getTodayDateKey();
    const conversacion = await ConversacionAsistente.findOne({ alumnaId });
    return getMensajesDelDia(conversacion, today);
  },
};
