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
  type EstructuraComida,
  type GenerarComidaPlanInput,
  type UpdatePlanNutricionalInput,
} from "@ivisfit/database";
import { sendPlanNutricionalEmail } from "@ivisfit/mail";
import { getAppName, getAppUrl, resolveAlumnaEmail } from "../lib/email.js";
import {
  filtrarCatalogoPorEvaluacion,
  loadCatalogoParaPlan,
  resolverDiasAlCatalogo,
} from "../lib/plan-catalog-ingredientes.js";
import { AppError, assertFound } from "../utils/errors.js";
import { medicionesService } from "./mediciones.service.js";
import {
  nutritionGeminiService,
  sanitizePlanDias,
} from "./nutrition-gemini.service.js";

const DEFAULT_MEAL_NAMES = [
  "Desayuno",
  "Almuerzo",
  "Merienda",
  "Cena",
  "Colación",
  "Snack",
];

function buildDefaultEstructura(cantidadComidas: number): EstructuraComida[] {
  const porComida = Math.floor(100 / cantidadComidas);
  const resto = 100 - porComida * cantidadComidas;
  return Array.from({ length: cantidadComidas }, (_, index) => ({
    nombre: DEFAULT_MEAL_NAMES[index] ?? `Comida ${index + 1}`,
    horario: undefined,
    porcentajeKcal: porComida + (index === 0 ? resto : 0),
  }));
}

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

async function matchIngredientesConCatalogo(
  dias: DiaPlanNutricional[],
): Promise<DiaPlanNutricional[]> {
  const catalog = await loadCatalogoParaPlan();
  if (catalog.length === 0) return dias;
  return resolverDiasAlCatalogo(dias, catalog);
}

function clonePlanDias(dias: DiaPlanNutricional[]): DiaPlanNutricional[] {
  return dias.map((dia) => ({
    nombre: dia.nombre,
    comidas: dia.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.map((ingrediente) => ({ ...ingrediente })),
    })),
  }));
}

function stripEmptyIngredientesFromDias(
  dias: DiaPlanNutricional[],
): DiaPlanNutricional[] {
  return dias.map((dia) => ({
    ...dia,
    comidas: dia.comidas.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.filter((ing) => Boolean(ing.nombre?.trim())),
    })),
  }));
}

function macrosFromPorcentaje(
  daily: MacrosObjetivo,
  porcentajeKcal: number,
): MacrosObjetivo {
  const kcalTotal =
    daily.proteinaG * 4 + daily.carbohidratosG * 4 + daily.grasasG * 9;
  const kcal = Math.round((daily.kcal * porcentajeKcal) / 100);
  if (kcalTotal <= 0) {
    return {
      kcal,
      proteinaG: roundMacro((daily.proteinaG * porcentajeKcal) / 100),
      carbohidratosG: roundMacro((daily.carbohidratosG * porcentajeKcal) / 100),
      grasasG: roundMacro((daily.grasasG * porcentajeKcal) / 100),
    };
  }
  const ratio = kcal / kcalTotal;
  return {
    kcal,
    proteinaG: roundMacro(daily.proteinaG * ratio),
    carbohidratosG: roundMacro(daily.carbohidratosG * ratio),
    grasasG: roundMacro(daily.grasasG * ratio),
  };
}

function buildComidasSlots(
  estructura: EstructuraComida[],
  macrosObjetivo: MacrosObjetivo,
): DiaPlanNutricional["comidas"] {
  return estructura.map((slot) => ({
    nombre: slot.nombre,
    horario: slot.horario,
    ingredientes: [],
    notas: "",
    preparacion: "",
    macrosObjetivo: macrosFromPorcentaje(macrosObjetivo, slot.porcentajeKcal),
  }));
}

function alignDiasConEstructura(
  dias: DiaPlanNutricional[],
  estructura: EstructuraComida[],
  macrosObjetivo: MacrosObjetivo,
): DiaPlanNutricional[] {
  const slots = buildComidasSlots(estructura, macrosObjetivo);
  return dias.map((dia) => ({
    ...dia,
    comidas: slots.map((slot, index) => {
      const comida = dia.comidas[index];
      if (!comida) {
        return {
          ...slot,
          ingredientes: slot.ingredientes.map((ing) => ({ ...ing })),
        };
      }
      return {
        ...comida,
        nombre: slot.nombre,
        horario: slot.horario,
        macrosObjetivo: slot.macrosObjetivo,
      };
    }),
  }));
}

function buildEmptyWeek(
  nombresDias: { nombre: string }[],
  estructura: EstructuraComida[],
  macrosObjetivo: MacrosObjetivo,
): DiaPlanNutricional[] {
  const comidasTemplate = buildComidasSlots(estructura, macrosObjetivo);
  return nombresDias.map(({ nombre }) => ({
    nombre,
    comidas: comidasTemplate.map((comida) => ({
      ...comida,
      ingredientes: comida.ingredientes.map((ing) => ({ ...ing })),
    })),
  }));
}

function summarizeDia(dia: DiaPlanNutricional): string {
  const comidas = dia.comidas
    .map((c) => c.ingredientes.map((i) => i.nombre).filter(Boolean).join(", "))
    .join(" / ");
  return `${dia.nombre}: ${comidas}`;
}

function tituloNuevaVersion(titulo: string): string {
  const trimmed = titulo.trim();
  const match = trimmed.match(/^(.*)\s+\(v(\d+)\)$/i);
  if (match) {
    const base = match[1]?.trim() ?? trimmed;
    const version = Number(match[2]) || 1;
    return `${base} (v${version + 1})`;
  }
  return `${trimmed} (v2)`;
}

export type PlanNutricionalProfeWorkspace = {
  editing: Awaited<ReturnType<typeof PlanNutricional.findOne>>;
  publicado: Awaited<ReturnType<typeof PlanNutricional.findOne>>;
};

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
    if (options?.includeDraft) {
      const borrador = await PlanNutricional.findOne({
        alumnaId,
        estado: "borrador",
      }).sort({ updatedAt: -1 });
      if (borrador) return borrador;

      return PlanNutricional.findOne({ alumnaId, estado: "publicado" }).sort({
        publicadoAt: -1,
      });
    }

    return PlanNutricional.findOne({ alumnaId, estado: "publicado" }).sort({
      publicadoAt: -1,
    });
  },

  async getProfeWorkspace(alumnaId: string) {
    const [borrador, publicado] = await Promise.all([
      PlanNutricional.findOne({ alumnaId, estado: "borrador" }).sort({
        updatedAt: -1,
      }),
      PlanNutricional.findOne({ alumnaId, estado: "publicado" }).sort({
        publicadoAt: -1,
      }),
    ]);

    return {
      borrador,
      publicado,
      editing: borrador ?? publicado,
    };
  },

  async createNewVersion(id: string) {
    const source = await PlanNutricional.findById(id);
    assertFound(source, "Plan nutricional no encontrado");

    if (source.estado !== "publicado") {
      throw new AppError(
        400,
        "Solo podés crear una nueva versión desde un plan publicado.",
      );
    }

    const existingDraft = await PlanNutricional.findOne({
      alumnaId: source.alumnaId,
      estado: "borrador",
    });
    if (existingDraft) {
      throw new AppError(
        409,
        "Ya hay un borrador pendiente. Continuá editándolo o descartalo antes de crear otra versión.",
      );
    }

    const diasMatched = await matchIngredientesConCatalogo(clonePlanDias(source.dias));
    const dias = await enrichDiasConMacros(diasMatched);

    return PlanNutricional.create({
      alumnaId: source.alumnaId,
      evaluacionId: source.evaluacionId,
      titulo: tituloNuevaVersion(source.titulo),
      observacionesProfe: source.observacionesProfe,
      macrosObjetivo: source.macrosObjetivo,
      dias,
      generadoPorIa: source.generadoPorIa,
      estado: "borrador",
      clonadoDesdeId: source._id,
      notificacionEnviada: Boolean(source.notificacionEnviada),
    });
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

    const dias = stripEmptyIngredientesFromDias(data.dias);
    return PlanNutricional.create({
      ...data,
      dias: await enrichDiasConMacros(dias),
      evaluacionId: data.evaluacionId ?? evaluacion._id,
      estado: "borrador",
    });
  },

  async update(id: string, data: UpdatePlanNutricionalInput) {
    const plan = await PlanNutricional.findById(id);
    assertFound(plan, "Plan nutricional no encontrado");

    const macrosObjetivo = data.macrosObjetivo ?? plan.macrosObjetivo;
    const estructura =
      data.estructuraComidas?.length
        ? data.estructuraComidas
        : plan.estructuraComidas?.length
          ? plan.estructuraComidas
          : undefined;

    let diasRaw = data.dias;
    if (diasRaw?.length && estructura?.length) {
      diasRaw = alignDiasConEstructura(diasRaw, estructura, macrosObjetivo);
    }

    const dias = diasRaw
      ? await enrichDiasConMacros(stripEmptyIngredientesFromDias(diasRaw))
      : undefined;
    Object.assign(plan, data, dias ? { dias } : {});
    if (data.listasComprasSemanas !== undefined) {
      plan.markModified("listasComprasSemanas");
    }
    await plan.save();
    return plan;
  },

  async publish(id: string) {
    const plan = await PlanNutricional.findById(id);
    assertFound(plan, "Plan nutricional no encontrado");

    if (plan.estado === "publicado") {
      return plan;
    }

    const validation = await this.validateForPublish(String(plan.alumnaId), {
      titulo: plan.titulo,
      macrosObjetivo: plan.macrosObjetivo,
      dias: plan.dias,
      estructuraComidas: plan.estructuraComidas,
      observacionesProfe: plan.observacionesProfe,
    });
    if (!validation.puedePublicar) {
      throw new AppError(
        400,
        "Hay errores en el plan (comidas vacías o alergias). Revisá el paso Revisar.",
      );
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

  async generateDraft(
    alumnaId: string,
    planId?: string,
    diasPlantilla?: { nombre: string }[],
    estructuraComidas?: EstructuraComida[],
    macrosOverride?: MacrosObjetivo,
  ) {
    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId,
      completada: true,
    });
    assertFound(evaluacion, "Evaluación nutricional no encontrada");

    const evalObj = evaluacion.toObject();
    const macrosObjetivo =
      macrosOverride ?? calculateMacrosObjetivo(evalObj);

    const planFromDb = planId ? await PlanNutricional.findById(planId) : null;
    if (planId) {
      assertFound(planFromDb, "Plan nutricional no encontrado");
      if (String(planFromDb.alumnaId) !== alumnaId) {
        throw new AppError(403, "El plan no pertenece a esta alumna");
      }
    }

    const skeletonFromPlan = planFromDb?.dias?.map((dia: DiaPlanNutricional) => ({
      nombre: dia.nombre,
    }));
    const skeleton =
      diasPlantilla?.length
        ? diasPlantilla
        : skeletonFromPlan?.length
          ? skeletonFromPlan
          : [
              { nombre: "Lunes" },
              { nombre: "Martes" },
              { nombre: "Miércoles" },
              { nombre: "Jueves" },
              { nombre: "Viernes" },
              { nombre: "Sábado" },
              { nombre: "Domingo" },
            ];

    const estructura =
      estructuraComidas?.length
        ? estructuraComidas
        : planFromDb?.estructuraComidas?.length
          ? planFromDb.estructuraComidas
          : buildDefaultEstructura(evalObj.cantidadComidas);

    const catalogRaw = await loadCatalogoParaPlan();
    const catalog = filtrarCatalogoPorEvaluacion(catalogRaw, evalObj);
    if (catalog.length === 0) {
      throw new AppError(
        400,
        "No hay alimentos en el catálogo (o todos quedaron excluidos por alergias/evitados). Cargá alimentos antes de usar IA.",
      );
    }

    const comidasSlots = buildComidasSlots(estructura, macrosObjetivo);
    const diasGenerados: DiaPlanNutricional[] = [];
    const resumenes: string[] = [];

    for (let diaIndex = 0; diaIndex < skeleton.length; diaIndex += 1) {
      const { nombre } = skeleton[diaIndex];
      const dia = await nutritionGeminiService.generateDayPlan(evalObj, {
        diaNombre: nombre,
        macrosObjetivo,
        estructuraComidas: estructura,
        comidasConObjetivo: comidasSlots,
        diasPreviosResumen: resumenes,
        catalog,
        diaSeed: diaIndex,
      });
      diasGenerados.push(dia);
      resumenes.push(summarizeDia(dia));
    }

    const draftBase = await nutritionGeminiService.generatePlanDraft(evalObj, catalog);
    const finalizedDraft = {
      titulo: draftBase.titulo,
      observacionesProfe: draftBase.observacionesProfe,
      macrosObjetivo,
      estructuraComidas: estructura,
      dias: diasGenerados,
      generadoPorIa: true,
    };

    const diasAlineados = alignDiasConEstructura(
      finalizedDraft.dias,
      estructura,
      macrosObjetivo,
    );
    const diasMatched = await matchIngredientesConCatalogo(
      sanitizePlanDias(diasAlineados),
    );
    const diasEnriched = await enrichDiasConMacros(diasMatched);
    const toSave = { ...finalizedDraft, dias: diasEnriched };

    if (planFromDb) {
      Object.assign(planFromDb, toSave, { generadoPorIa: true });
      await planFromDb.save();
      return planFromDb;
    }

    const existingDraft = await PlanNutricional.findOne({
      alumnaId,
      estado: "borrador",
    });
    if (existingDraft) {
      Object.assign(existingDraft, toSave, { generadoPorIa: true });
      await existingDraft.save();
      return existingDraft;
    }

    const existingPublished = await PlanNutricional.findOne({
      alumnaId,
      estado: "publicado",
    }).sort({ publicadoAt: -1 });
    if (existingPublished) {
      Object.assign(existingPublished, toSave, { generadoPorIa: true });
      await existingPublished.save();
      return existingPublished;
    }

    return PlanNutricional.create({
      alumnaId,
      evaluacionId: evaluacion._id,
      ...toSave,
      estado: "borrador",
    });
  },

  async generateComida(input: GenerarComidaPlanInput) {
    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId: input.alumnaId,
      completada: true,
    });
    assertFound(evaluacion, "Evaluación nutricional no encontrada");

    let comidaObjetivo: MacrosObjetivo | undefined;
    if (input.planId) {
      const plan = await PlanNutricional.findById(input.planId);
      if (plan?.dias[input.diaIndex]?.comidas[input.comidaIndex]) {
        comidaObjetivo =
          plan.dias[input.diaIndex].comidas[input.comidaIndex].macrosObjetivo;
      }
    }

    const catalogRaw = await loadCatalogoParaPlan();
    const evalObj = evaluacion.toObject();
    const catalog = filtrarCatalogoPorEvaluacion(catalogRaw, evalObj);
    if (catalog.length === 0) {
      throw new AppError(
        400,
        "No hay alimentos en el catálogo (o todos quedaron excluidos por alergias/evitados). Cargá alimentos antes de usar IA.",
      );
    }

    const comida = await nutritionGeminiService.generateComidaPlan(evalObj, {
      ...input,
      comidaObjetivo,
      catalog,
      comidaSeed: input.diaIndex * 10 + input.comidaIndex,
    });

    const matched = await matchIngredientesConCatalogo([
      { nombre: "tmp", comidas: [comida] },
    ]);
    const enriched = await enrichDiasConMacros(matched);
    return enriched[0]?.comidas[0] ?? comida;
  },

  async listPlanesReutilizables() {
    const planes = await PlanNutricional.find({
      estado: { $in: ["publicado", "borrador", "archivado"] },
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate("alumnaId", "nombre")
      .lean();

    return planes.map((plan) => ({
      id: String(plan._id),
      alumnaId: String(plan.alumnaId?._id ?? plan.alumnaId),
      alumnaNombre:
        typeof plan.alumnaId === "object" && plan.alumnaId && "nombre" in plan.alumnaId
          ? String((plan.alumnaId as { nombre?: string }).nombre ?? "Alumna")
          : "Alumna",
      titulo: plan.titulo,
      estado: plan.estado,
      updatedAt: plan.updatedAt?.toISOString(),
    }));
  },

  async cloneToAlumna(sourcePlanId: string, alumnaId: string, targetPlanId?: string) {
    const source = await PlanNutricional.findById(sourcePlanId);
    assertFound(source, "Plan no encontrado");

    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId,
      completada: true,
    });
    assertFound(evaluacion, "Evaluación nutricional no encontrada");

    const dias = stripEmptyIngredientesFromDias(clonePlanDias(source.dias));
    const diasMatched = await matchIngredientesConCatalogo(dias);
    const diasEnriched = await enrichDiasConMacros(diasMatched);

    const payload = {
      titulo: source.titulo,
      observacionesProfe: source.observacionesProfe,
      macrosObjetivo: source.macrosObjetivo,
      estructuraComidas: source.estructuraComidas,
      dias: diasEnriched,
      clonadoDesdeId: source._id,
      evaluacionId: evaluacion._id,
      generadoPorIa: false,
    };

    if (targetPlanId) {
      const target = await PlanNutricional.findById(targetPlanId);
      assertFound(target, "Plan no encontrado");
      if (String(target.alumnaId) !== alumnaId) {
        throw new AppError(403, "El plan no pertenece a esta alumna");
      }
      Object.assign(target, payload);
      await target.save();
      return target;
    }

    const existingDraft = await PlanNutricional.findOne({
      alumnaId,
      estado: "borrador",
    });
    if (existingDraft) {
      Object.assign(existingDraft, payload);
      await existingDraft.save();
      return existingDraft;
    }

    const existingPublished = await PlanNutricional.findOne({
      alumnaId,
      estado: "publicado",
    }).sort({ publicadoAt: -1 });
    if (existingPublished) {
      Object.assign(existingPublished, payload);
      await existingPublished.save();
      return existingPublished;
    }

    return PlanNutricional.create({
      alumnaId,
      estado: "borrador",
      ...payload,
    });
  },

  async validateForPublish(alumnaId: string, plan: UpdatePlanNutricionalInput) {
    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId,
      completada: true,
    });
    assertFound(evaluacion, "Evaluación nutricional no encontrada");

    const NOMBRES_PLACEHOLDER_IA = new Set([
      "proteína magra",
      "proteina magra",
      "carbohidrato",
      "carbohidrato complejo",
      "vegetales",
    ]);

    const items: {
      id: string;
      nivel: "error" | "warning";
      mensaje: string;
    }[] = [];
    const seenIds = new Set<string>();
    const pushItem = (item: {
      id: string;
      nivel: "error" | "warning";
      mensaje: string;
    }) => {
      if (seenIds.has(item.id)) return;
      seenIds.add(item.id);
      items.push(item);
    };

    const alergias = evaluacion.alergias ?? [];
    const evitados = evaluacion.alimentosEvitados ?? [];
    const macrosObjetivo = plan.macrosObjetivo;
    const dias = plan.dias ?? [];
    const placeholdersIa = new Set<string>();
    const catalogoSinMatch = new Set<string>();

    for (const dia of dias) {
      for (const comida of dia.comidas) {
        const vacia = !comida.ingredientes.some((ing) => ing.nombre?.trim());
        if (vacia) {
          pushItem({
            id: `vacia-${dia.nombre}-${comida.nombre}`,
            nivel: "error",
            mensaje: `${dia.nombre} · ${comida.nombre}: comida sin ingredientes`,
          });
        }
        for (const ing of comida.ingredientes) {
          const nombreIng = ing.nombre?.trim() ?? "";
          if (!nombreIng) continue;

          const nombreLower = nombreIng.toLowerCase();
          if (!ing.alimentoId) {
            if (NOMBRES_PLACEHOLDER_IA.has(nombreLower)) {
              placeholdersIa.add(nombreIng);
            } else {
              catalogoSinMatch.add(nombreIng);
            }
          }

          for (const alergia of alergias) {
            if (alergia && nombreLower.includes(alergia.toLowerCase())) {
              pushItem({
                id: `alergia-${nombreLower}-${alergia.toLowerCase()}`,
                nivel: "error",
                mensaje: `Posible alergia (${alergia}): ${nombreIng} en ${comida.nombre}`,
              });
            }
          }
          for (const evitado of evitados) {
            if (evitado && nombreLower.includes(evitado.toLowerCase())) {
              pushItem({
                id: `evitado-${nombreLower}-${evitado.toLowerCase()}`,
                nivel: "warning",
                mensaje: `Alimento evitado “${evitado}” en ${nombreIng}`,
              });
            }
          }
        }
        if (
          comida.macrosObjetivo &&
          comida.macrosComida &&
          comida.macrosComida.kcal > 0
        ) {
          for (const key of ["kcal", "proteinaG", "carbohidratosG", "grasasG"] as const) {
            const target = comida.macrosObjetivo[key];
            const actual = comida.macrosComida[key];
            if (target > 0 && Math.abs(actual - target) / target > 0.05) {
              pushItem({
                id: `macro-${comida.nombre}-${key}`,
                nivel: "warning",
                mensaje: `${comida.nombre}: ${key} ${actual} vs meta ${target}`,
              });
            }
          }
        }
      }
    }

    if (placeholdersIa.size > 0) {
      const lista = [...placeholdersIa].map((n) => `«${n}»`).join(", ");
      pushItem({
        id: "placeholders-ia",
        nivel: "warning",
        mensaje: `Ingredientes genéricos de IA (${lista}): reemplazalos por alimentos del catálogo en Comidas para calcular macros.`,
      });
    }

    if (catalogoSinMatch.size > 0) {
      const lista = [...catalogoSinMatch].map((n) => `«${n}»`).join(", ");
      pushItem({
        id: "catalogo-sin-match",
        nivel: "warning",
        mensaje: `Sin match en catálogo: ${lista}. Elegí un alimento del listado o cargá macros manualmente.`,
      });
    }

    if (macrosObjetivo && dias.length > 0) {
      const primerDia = dias[0];
      const total = primerDia.comidas.reduce(
        (acc, comida) => {
          const m = comida.macrosComida;
          if (!m) return acc;
          return {
            kcal: acc.kcal + m.kcal,
            proteinaG: acc.proteinaG + m.proteinaG,
            carbohidratosG: acc.carbohidratosG + m.carbohidratosG,
            grasasG: acc.grasasG + m.grasasG,
          };
        },
        { kcal: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0 },
      );
      if (macrosObjetivo.kcal > 0) {
        if (total.kcal === 0) {
          pushItem({
            id: "macro-dia-sin-kcal",
            nivel: "warning",
            mensaje:
              "No hay kcal calculadas en el día tipo: usá alimentos del catálogo en Comidas (los placeholders de IA no suman macros).",
          });
        } else if (
          Math.abs(total.kcal - macrosObjetivo.kcal) / macrosObjetivo.kcal > 0.05
        ) {
          pushItem({
            id: "macro-dia-kcal",
            nivel: "warning",
            mensaje: `Día tipo: ${total.kcal} kcal vs objetivo ${macrosObjetivo.kcal}`,
          });
        }
      }
    }

    return {
      items,
      puedePublicar: !items.some((item) => item.nivel === "error"),
    };
  },

  buildEmptyWeekFromEstructura(
    nombresDias: { nombre: string }[],
    estructura: EstructuraComida[],
    macrosObjetivo: MacrosObjetivo,
  ) {
    return buildEmptyWeek(nombresDias, estructura, macrosObjetivo);
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
