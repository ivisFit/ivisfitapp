import {
  PlanNutricional,
  PlanNutricionalTemplate,
  EvaluacionNutricional,
  type CreatePlanNutricionalTemplateInput,
  type UpdatePlanNutricionalTemplateInput,
} from "@ivisfit/database";
import { AppError, assertFound } from "../utils/errors.js";
export const planNutricionalTemplateService = {
  async list(profeId: string) {
    return PlanNutricionalTemplate.find({ profeId })
      .sort({ updatedAt: -1 })
      .lean();
  },

  async getById(id: string, profeId: string) {
    const template = await PlanNutricionalTemplate.findOne({ _id: id, profeId });
    assertFound(template, "Plantilla no encontrada");
    return template;
  },

  async create(profeId: string, data: CreatePlanNutricionalTemplateInput) {
    return PlanNutricionalTemplate.create({
      profeId,
      ...data,
    });
  },

  async update(id: string, profeId: string, data: UpdatePlanNutricionalTemplateInput) {
    const template = await PlanNutricionalTemplate.findOne({ _id: id, profeId });
    assertFound(template, "Plantilla no encontrada");
    Object.assign(template, data);
    await template.save();
    return template;
  },

  async remove(id: string, profeId: string) {
    const template = await PlanNutricionalTemplate.findOne({ _id: id, profeId });
    assertFound(template, "Plantilla no encontrada");
    await template.deleteOne();
  },

  async createFromPlan(planId: string, profeId: string, titulo: string, descripcion?: string) {
    const plan = await PlanNutricional.findById(planId);
    assertFound(plan, "Plan no encontrado");

    return PlanNutricionalTemplate.create({
      profeId,
      titulo,
      descripcion,
      macrosObjetivo: plan.macrosObjetivo,
      estructuraComidas: plan.estructuraComidas ?? [],
      dias: plan.dias,
    });
  },

  async applyToAlumna(
    plantillaId: string,
    profeId: string,
    alumnaId: string,
    planId?: string,
  ) {
    const plantilla = await PlanNutricionalTemplate.findOne({
      _id: plantillaId,
      profeId,
    });
    assertFound(plantilla, "Plantilla no encontrada");

    const evaluacion = await EvaluacionNutricional.findOne({
      alumnaId,
      completada: true,
    });
    assertFound(evaluacion, "Evaluación nutricional no encontrada");

    const planFromDb = planId ? await PlanNutricional.findById(planId) : null;
    if (planId) {
      assertFound(planFromDb, "Plan no encontrado");
      if (String(planFromDb.alumnaId) !== alumnaId) {
        throw new AppError(403, "El plan no pertenece a esta alumna");
      }
    }

    const payload = {
      titulo: plantilla.titulo,
      macrosObjetivo: plantilla.macrosObjetivo,
      estructuraComidas: plantilla.estructuraComidas,
      dias: plantilla.dias,
      evaluacionId: evaluacion._id,
      generadoPorIa: false,
    };

    if (planFromDb) {
      Object.assign(planFromDb, payload);
      await planFromDb.save();
      return planFromDb;
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
};
