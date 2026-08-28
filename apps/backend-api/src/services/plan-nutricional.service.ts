import {
  Alimento,
  CoachInsight,
  EvaluacionNutricional,
  PlanNutricional,
  Usuario,
  calculateImc,
  calculateMacrosObjetivo,
  type CreatePlanNutricionalInput,
  type DiaPlanNutricional,
  type MacrosObjetivo,
  type UpdatePlanNutricionalInput,
} from "@ivisfit/database";
import { sendPlanNutricionalEmail } from "@ivisfit/mail";
import { getAppName, getAppUrl, resolveAlumnaEmail } from "../lib/email.js";
import { AppError, assertFound } from "../utils/errors.js";
import { medicionesService } from "./mediciones.service.js";
import { nutritionGeminiService } from "./nutrition-gemini.service.js";

function roundMacro(value: number): number {
  return Math.round(value * 10) / 10;
}

function sumMacros(macros: (MacrosObjetivo | undefined)[]): MacrosObjetivo | undefined {
  const validos = macros.filter((macro): macro is MacrosObjetivo => Boolean(macro));
  if (validos.length === 0) return undefined;

  return validos.reduce(
    (total, macro) => ({
      kcal: Math.round(total.kcal + macro.kcal),
      proteinaG: roundMacro(total.proteinaG + macro.proteinaG),
      carbohidratosG: roundMacro(total.carbohidratosG + macro.carbohidratosG),
      grasasG: roundMacro(total.grasasG + macro.grasasG),
    }),
    { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
  );
}

async function enrichDiasConMacros(
  dias: DiaPlanNutricional[],
): Promise<DiaPlanNutricional[]> {
  const alimentoIds = new Set<string>();
  for (const dia of dias) {
    for (const comida of dia.comidas) {
      for (const ingrediente of comida.ingredientes) {
        if (ingrediente.alimentoId) alimentoIds.add(String(ingrediente.alimentoId));
      }
    }
  }

  const alimentos =
    alimentoIds.size > 0
      ? await Alimento.find({ _id: { $in: Array.from(alimentoIds) } })
      : [];
  const alimentoMap = new Map(alimentos.map((alimento) => [String(alimento._id), alimento]));

  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map((comida) => {
      const ingredientes = comida.ingredientes.map((ingrediente) => {
        if (!ingrediente.alimentoId) return ingrediente;

        const alimento = alimentoMap.get(String(ingrediente.alimentoId));
        if (!alimento) return ingrediente;

        const factor = ingrediente.cantidad / alimento.porcionReferencia.cantidad;
        return {
          ...ingrediente,
          kcal: Math.round(alimento.macrosPorPorcion.kcal * factor),
          proteinaG: roundMacro(alimento.macrosPorPorcion.proteinaG * factor),
          carbohidratosG: roundMacro(alimento.macrosPorPorcion.carbohidratosG * factor),
          grasasG: roundMacro(alimento.macrosPorPorcion.grasasG * factor),
        };
      });

      const macrosComida = sumMacros(
        ingredientes.map((ingrediente) =>
          ingrediente.kcal !== undefined
            ? {
                kcal: ingrediente.kcal,
                proteinaG: ingrediente.proteinaG ?? 0,
                carbohidratosG: ingrediente.carbohidratosG ?? 0,
                grasasG: ingrediente.grasasG ?? 0,
              }
            : undefined,
        ),
      );

      return { ...comida, ingredientes, macrosComida };
    }),
  }));
}

export type GestionAlimentacionItem = {
  alumnaId: string;
  alumnaNombre: string;
  alumnaEmail: string;
  evaluacionId: string;
  evaluacionCompletada: boolean;
  evaluacionCreatedAt?: string;
  planId?: string;
  planEstado?: "borrador" | "publicado" | "archivado";
  planTitulo?: string;
  publicadoAt?: string;
};

export const planNutricionalService = {
  async listGestionItems(): Promise<GestionAlimentacionItem[]> {
    const evaluaciones = await EvaluacionNutricional.find({ completada: true })
      .sort({ createdAt: -1 })
      .lean();

    if (evaluaciones.length === 0) return [];

    const alumnaIds = evaluaciones.map((item) => item.alumnaId);
    const [alumnas, planes] = await Promise.all([
      Usuario.find({ _id: { $in: alumnaIds } })
        .select("nombre email")
        .lean(),
      PlanNutricional.find({
        alumnaId: { $in: alumnaIds },
        estado: { $in: ["borrador", "publicado"] },
      })
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    const alumnaMap = new Map(
      alumnas.map((alumna) => [String(alumna._id), alumna]),
    );
    const planMap = new Map<string, (typeof planes)[number]>();

    for (const plan of planes) {
      const key = String(plan.alumnaId);
      if (!planMap.has(key)) {
        planMap.set(key, plan);
      }
    }

    return evaluaciones.map((evaluacion) => {
      const alumna = alumnaMap.get(String(evaluacion.alumnaId));
      const plan = planMap.get(String(evaluacion.alumnaId));

      return {
        alumnaId: String(evaluacion.alumnaId),
        alumnaNombre: alumna?.nombre ?? "Alumna",
        alumnaEmail: alumna?.correo ?? "",
        evaluacionId: String(evaluacion._id),
        evaluacionCompletada: Boolean(evaluacion.completada),
        evaluacionCreatedAt: evaluacion.createdAt?.toISOString(),
        planId: plan ? String(plan._id) : undefined,
        planEstado: plan?.estado,
        planTitulo: plan?.titulo,
        publicadoAt: plan?.publicadoAt?.toISOString(),
      };
    });
  },

  async getByAlumnaId(alumnaId: string, options?: { includeDraft?: boolean }) {
    const filter: Record<string, unknown> = { alumnaId };
    if (!options?.includeDraft) {
      filter.estado = "publicado";
    } else {
      filter.estado = { $in: ["borrador", "publicado"] };
    }

    return PlanNutricional.findOne(filter).sort({ updatedAt: -1 });
  },

  async getById(id: string) {
    return PlanNutricional.findById(id);
  },

  async create(data: CreatePlanNutricionalInput) {
    const alumna = await Usuario.findById(data.alumnaId);
    assertFound(alumna, "Alumna no encontrada");

    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId: data.alumnaId,
      completada: true,
    });
    if (!evaluacion) {
      throw new AppError(
        400,
        "La alumna debe completar la evaluación nutricional primero",
      );
    }

    const existingDraft = await PlanNutricional.findOne({
      alumnaId: data.alumnaId,
      estado: "borrador",
    });
    if (existingDraft) {
      throw new AppError(
        409,
        "Ya existe un borrador. Editá el plan existente o publicalo antes de crear otro.",
      );
    }

    return PlanNutricional.create({
      ...data,
      dias: await enrichDiasConMacros(data.dias),
      evaluacionId: data.evaluacionId ?? evaluacion._id,
      estado: "borrador",
    });
  },

  async update(id: string, data: UpdatePlanNutricionalInput) {
    const plan = await PlanNutricional.findById(id);
    assertFound(plan, "Plan nutricional no encontrado");

    if (plan.estado === "publicado") {
      throw new AppError(
        400,
        "No se puede editar un plan publicado. Archivalo y creá uno nuevo.",
      );
    }

    const dias = data.dias ? await enrichDiasConMacros(data.dias) : undefined;
    Object.assign(plan, data, dias ? { dias } : {});
    await plan.save();
    return plan;
  },

  async publish(id: string) {
    const plan = await PlanNutricional.findById(id);
    assertFound(plan, "Plan nutricional no encontrado");

    if (plan.estado === "publicado") {
      return plan;
    }

    await PlanNutricional.updateMany(
      { alumnaId: plan.alumnaId, estado: "publicado", _id: { $ne: plan._id } },
      { estado: "archivado" },
    );

    plan.estado = "publicado";
    plan.publicadoAt = new Date();
    await plan.save();

    if (!plan.notificacionEnviada) {
      const alumna = await Usuario.findById(plan.alumnaId);
      const to = alumna ? resolveAlumnaEmail(alumna) : null;
      if (to && alumna) {
        try {
          await sendPlanNutricionalEmail({
            to,
            alumnaNombre: alumna.nombre,
            appName: getAppName(),
            appUrl: getAppUrl(),
          });
          plan.notificacionEnviada = true;
          await plan.save();

          await CoachInsight.create({
            alumnaId: plan.alumnaId,
            tipo: "plan_publicado",
            mensaje:
              "Tu plan nutricional ya está publicado. Entrá a Alimentación para verlo.",
            prioridad: 5,
            leido: false,
            accionSugerida: "Abrí la sección Alimentación",
            perfil: "celebracion",
          });
        } catch (error) {
          console.error("No se pudo enviar email de plan nutricional:", error);
        }
      }
    }

    return plan;
  },

  async archive(id: string) {
    const plan = await PlanNutricional.findById(id);
    assertFound(plan, "Plan nutricional no encontrado");
    plan.estado = "archivado";
    await plan.save();
    return plan;
  },

  async remove(id: string) {
    const plan = await PlanNutricional.findById(id);
    assertFound(plan, "Plan nutricional no encontrado");

    if (plan.estado === "publicado") {
      throw new AppError(400, "No se puede eliminar un plan publicado");
    }

    await plan.deleteOne();
  },

  async generateDraft(alumnaId: string, planId?: string) {
    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId,
      completada: true,
    });
    assertFound(evaluacion, "Evaluación nutricional no encontrada");

    const draft = await nutritionGeminiService.generatePlanDraft(
      evaluacion.toObject(),
    );

    if (planId) {
      const plan = await PlanNutricional.findById(planId);
      assertFound(plan, "Plan nutricional no encontrado");
      if (String(plan.alumnaId) !== alumnaId) {
        throw new AppError(403, "El plan no pertenece a esta alumna");
      }
      if (plan.estado === "publicado") {
        throw new AppError(400, "No se puede regenerar un plan publicado");
      }

      Object.assign(plan, draft, { generadoPorIa: true });
      await plan.save();
      return plan;
    }

    const existingDraft = await PlanNutricional.findOne({
      alumnaId,
      estado: "borrador",
    });
    if (existingDraft) {
      Object.assign(existingDraft, draft, { generadoPorIa: true });
      await existingDraft.save();
      return existingDraft;
    }

    return PlanNutricional.create({
      alumnaId,
      evaluacionId: evaluacion._id,
      ...draft,
      estado: "borrador",
    });
  },

  async getMacrosSugeridos(alumnaId: string) {
    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId,
      completada: true,
    });
    assertFound(evaluacion, "Evaluación nutricional no encontrada");
    return calculateMacrosObjetivo(evaluacion.toObject());
  },

  async chat(
    rol: "alumna" | "profe",
    mensaje: string,
    alumnaId?: string,
    planId?: string,
  ) {
    let evaluacion = null;
    let plan = null;
    let alumnaNombre: string | undefined;

    if (alumnaId) {
      const alumna = await Usuario.findById(alumnaId);
      alumnaNombre = alumna?.nombre;
      evaluacion = await EvaluacionNutricional.findOne({
        alumnaId,
        completada: true,
      });
    }

    if (planId) {
      plan = await PlanNutricional.findById(planId);
    } else if (alumnaId) {
      plan = await this.getByAlumnaId(alumnaId, {
        includeDraft: rol === "profe",
      });
    }

    const reply = await nutritionGeminiService.chat(rol, mensaje, {
      evaluacion: evaluacion?.toObject(),
      plan: plan
        ? {
            titulo: plan.titulo,
            macrosObjetivo: plan.macrosObjetivo,
            dias: plan.dias,
            observacionesProfe: plan.observacionesProfe ?? undefined,
          }
        : undefined,
      alumnaNombre,
    });

    return { reply };
  },

  async getEvaluacionBriefing(alumnaId: string) {
    const [evaluacion, alumna, ultimaMedicion] = await Promise.all([
      EvaluacionNutricional.findOne({ alumnaId, completada: true }),
      Usuario.findById(alumnaId).select("nombre alturaCm"),
      medicionesService.getUltimaByAlumna(alumnaId),
    ]);
    assertFound(evaluacion, "Evaluación nutricional no encontrada");

    const pesoKg = ultimaMedicion?.pesoCorporalKg ?? undefined;
    const composicionCorporal =
      ultimaMedicion && (pesoKg || ultimaMedicion.metricas?.porcentajeGrasaCorporal != null)
        ? {
            pesoKg,
            imc: pesoKg && alumna?.alturaCm ? calculateImc(pesoKg, alumna.alturaCm) : undefined,
            porcentajeGrasaCorporal:
              ultimaMedicion.metricas?.porcentajeGrasaCorporal ?? undefined,
            masaMagra: ultimaMedicion.metricas?.masaMagra ?? undefined,
            fechaMedicion: ultimaMedicion.fecha?.toISOString(),
          }
        : undefined;

    const briefing = await nutritionGeminiService.buildEvaluacionBriefing(
      evaluacion.toObject(),
      alumna?.nombre ?? "Alumna",
      composicionCorporal,
    );

    return {
      briefing,
      macrosSugeridos: calculateMacrosObjetivo(evaluacion.toObject()),
      composicionCorporal,
    };
  },
};
