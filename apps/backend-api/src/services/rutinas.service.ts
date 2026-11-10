import {
  CoachInsight,
  Rutina,
  Usuario,
  type CreateRutinaInput,
  type DuplicarSemanaInput,
  type UpdateRutinaInput,
} from "@ivisfit/database";
import { sendRutinaAsignadaEmail } from "@ivisfit/mail";
import { getAppName, getAppUrl, resolveAlumnaEmail } from "../lib/email.js";
import {
  addCalendarDays,
  formatRutinaDateKeyLong,
  isRutinaVisibleToday,
  rutinaStartKey,
} from "../lib/rutina-schedule.js";
import {
  enrichRutinaChallenge28WithTemplate,
  mergeRutinaInputChallenge28WithTemplate,
} from "./plan-template-rutina-sync.service.js";
import { AppError, assertFound } from "../utils/errors.js";

function unidadEjercicio(
  value: unknown,
): "repeticiones" | "segundos" {
  return value === "segundos" ? "segundos" : "repeticiones";
}

function registroEjercicio(value: unknown): "peso" | "check" {
  return value === "check" ? "check" : "peso";
}

type SemanaPlain = {
  numeroSemana: number;
  dias: {
    nombreDia: string;
    comentario?: string;
    fecha?: string;
    ejercicios: {
      ejercicioId: unknown;
      series: number;
      repeticiones: number;
      repeticionesPorSerie?: number[];
      unidad?: "repeticiones" | "segundos";
      registro?: "peso" | "check";
      descansoSegundos: number;
      media?: unknown;
    }[];
  }[];
};

export const rutinasService = {
  async list(alumnaId?: string) {
    const filter = alumnaId ? { alumnaId } : {};
    return Rutina.find(filter)
      .populate("alumnaId", "nombre correo")
      .populate("planTemplateId", "nombre slug formato inversion duracionSemanas")
      .sort({ createdAt: -1 });
  },

  async getById(id: string) {
    const rutina = await Rutina.findById(id)
      .populate("alumnaId", "nombre correo")
      .populate("planTemplateId", "nombre slug formato inversion duracionSemanas")
      .populate(
        "semanas.dias.ejercicios.ejercicioId",
        "nombre videoUrl descripcion",
      );
    assertFound(rutina, "Rutina no encontrada");

    const mergedChallenge28 = await enrichRutinaChallenge28WithTemplate(
      rutina,
      { persist: true },
    );

    if (mergedChallenge28 !== undefined) {
      rutina.set("challenge28", mergedChallenge28);
    }

    return rutina;
  },

  async create(data: CreateRutinaInput) {
    const payload = await mergeRutinaInputChallenge28WithTemplate(data);
    const rutina = await Rutina.create(payload);

    try {
      const alumna = await Usuario.findById(rutina.alumnaId);
      const to = alumna ? resolveAlumnaEmail(alumna) : null;
      if (to && alumna) {
        const planNombre =
          rutina.planTemplateSnapshot?.nombre ?? rutina.nombrePlan;
        const hermanas = await Rutina.find({ alumnaId: rutina.alumnaId }).select(
          "startDate createdAt updatedAt duracionSemanas",
        );
        const visibleHoy = isRutinaVisibleToday(rutina, hermanas);
        const inicioKey = rutinaStartKey(rutina);
        const inicioProgramado =
          !visibleHoy && inicioKey ? formatRutinaDateKeyLong(inicioKey) : undefined;
        await sendRutinaAsignadaEmail({
          to,
          alumnaNombre: alumna.nombre,
          planNombre: planNombre || undefined,
          appName: getAppName(),
          appUrl: getAppUrl(),
          programada: !visibleHoy,
          inicioProgramado,
        });
        const mensaje = !visibleHoy
          ? inicioProgramado
            ? planNombre
              ? `Tu rutina "${planNombre}" empieza el ${inicioProgramado}. Hasta esa fecha seguís con la rutina actual.`
              : `Tenés una rutina nueva que empieza el ${inicioProgramado}. Hasta esa fecha seguís con la rutina actual.`
            : planNombre
              ? `Tu rutina "${planNombre}" ya está preparada. Seguís con la rutina actual hasta que termine.`
              : "Tenés una rutina nueva preparada. Seguís con la actual hasta que termine."
          : planNombre
            ? `Tu rutina "${planNombre}" ya está lista. Entrá a Mi rutina para empezar.`
            : "Tu rutina ya está lista. Entrá a Mi rutina para empezar.";
        await CoachInsight.create({
          alumnaId: rutina.alumnaId,
          tipo: "rutina_asignada",
          mensaje,
          prioridad: 5,
          leido: false,
          accionSugerida: "Abrí Mi rutina",
          perfil: "celebracion",
        });
      }
    } catch (error) {
      console.error("No se pudo notificar rutina asignada:", error);
    }

    return rutina;
  },

  async update(id: string, data: UpdateRutinaInput) {
    const existing = await Rutina.findById(id);
    assertFound(existing, "Rutina no encontrada");

    const payload = await mergeRutinaInputChallenge28WithTemplate(
      {
        ...data,
        planTemplateId: data.planTemplateId ?? existing.planTemplateId,
        planTemplateSnapshot:
          data.planTemplateSnapshot ?? existing.planTemplateSnapshot,
        nombrePlan: data.nombrePlan ?? existing.nombrePlan,
      },
      existing.challenge28 as Parameters<
        typeof mergeRutinaInputChallenge28WithTemplate
      >[1],
    );

    const { semanas, ...rest } = payload;
    existing.set(rest);
    if (semanas) {
      existing.set("semanas", semanas);
      existing.markModified("semanas");
    }
    if ("challenge28" in payload) {
      existing.markModified("challenge28");
    }

    await existing.save();
    return existing;
  },

  async remove(id: string) {
    const rutina = await Rutina.findByIdAndDelete(id);
    return assertFound(rutina, "Rutina no encontrada");
  },

  async duplicarSemana(id: string, data: DuplicarSemanaInput) {
    const rutina = await Rutina.findById(id);
    assertFound(rutina, "Rutina no encontrada");

    const semanas: SemanaPlain[] = JSON.parse(
      JSON.stringify(rutina.semanas),
    ) as SemanaPlain[];

    const semanaOrigen = semanas.find(
      (s) => s.numeroSemana === data.numeroSemanaOrigen,
    );
    if (!semanaOrigen) {
      throw new AppError(
        404,
        `Semana origen ${data.numeroSemanaOrigen} no encontrada`,
      );
    }

    const semanaDestinoIndex = semanas.findIndex(
      (s) => s.numeroSemana === data.numeroSemanaDestino,
    );

    const weekShift = data.numeroSemanaDestino - data.numeroSemanaOrigen;
    const diasClonados = semanaOrigen.dias.map((dia) => ({
      nombreDia: dia.nombreDia,
      ...(dia.comentario?.trim()
        ? { comentario: dia.comentario.trim() }
        : {}),
      ...(dia.fecha && /^\d{4}-\d{2}-\d{2}$/.test(dia.fecha)
        ? { fecha: addCalendarDays(dia.fecha, weekShift * 7) }
        : {}),
      ejercicios: dia.ejercicios.map((ej) => ({
        ejercicioId: ej.ejercicioId,
        series: ej.series,
        repeticiones: ej.repeticiones,
        unidad: unidadEjercicio(ej.unidad),
        registro: registroEjercicio(ej.registro),
        descansoSegundos: ej.descansoSegundos,
        ...(ej.repeticionesPorSerie?.length
          ? { repeticionesPorSerie: [...ej.repeticionesPorSerie] }
          : {}),
        ...(ej.media ? { media: ej.media } : {}),
      })),
    }));

    if (semanaDestinoIndex >= 0) {
      semanas[semanaDestinoIndex] = {
        ...semanas[semanaDestinoIndex],
        dias: diasClonados,
      };
    } else {
      semanas.push({
        numeroSemana: data.numeroSemanaDestino,
        dias: diasClonados,
      });
      semanas.sort((a, b) => a.numeroSemana - b.numeroSemana);
    }

    const updated = await Rutina.findByIdAndUpdate(
      id,
      { semanas },
      { new: true, runValidators: true },
    );
    return assertFound(updated, "Rutina no encontrada");
  },
};
