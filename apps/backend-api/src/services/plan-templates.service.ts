import {
  PlanTemplate,
  type CreatePlanTemplateInput,
  type UpdatePlanTemplateInput,
} from "@ivisfit/database";
import { syncTemplateDayVideosToLinkedRutinas } from "./plan-template-rutina-sync.service.js";
import { AppError, assertFound, isDuplicateKeyError } from "../utils/errors.js";

const presentacionIvis = {
  nombre: "Ivis Fernández",
  bio: "Entrenadora personal con formación en educación física, musculación y nutrición deportiva. Mi misión es ayudarte a alcanzar tu mejor versión.",
  especialidades:
    "Especialista en Musculación Femenina con enfoque en Recomposición Corporal.",
  filosofia:
    "Seguimiento 100% personalizado, transformando vidas a través del deporte y la disciplina.",
  lema: "# ENTRENA CON PROPÓSITO 2026",
  contacto: {
    instagram: "@iviis.fit",
    email: "ivannafernandez7@gmail.com",
    telefono: "+598 98 390 351",
    web: "www.ivisfit.com",
  },
};

const defaultPlanTemplates: CreatePlanTemplateInput[] = [
  {
    slug: "gluteos-de-acero",
    orden: 1,
    nombre: "Plan de Glúteos de Acero",
    resumen:
      "Programa de nivel élite para hipertrofia de glúteos y piernas con biomecánica avanzada.",
    descripcion:
      "Programa diseñado científicamente para forjar una hipertrofia de glúteos y piernas de hierro, optimizando cada repetición con periodización estratégica para resultados tangibles.",
    duracionSemanas: 8,
    duracionLabel: "8 semanas (2 meses)",
    formato: "Específico",
    enfoque: "Tren inferior al límite, con entrenamientos enfocados en glúteos y piernas.",
    metodologia:
      "Rutinas progresivas y efectivas con sobrecarga progresiva científica y controlada para hipertrofia máxima.",
    extras: [
      "Plan nutricional de precisión para crecimiento de glúteos",
      "Protocolos de recuperación y movilidad",
      "Soporte exclusivo y seguimiento semanal",
    ],
    inversion: "$3000",
    precio: 3000,
    moneda: "UYU",
    presentacion: presentacionIvis,
  },
  {
    slug: "abs-power",
    orden: 2,
    nombre: "Abs Power",
    resumen:
      "Rutinas cortas e intensas para fortalecer el core, estabilidad y estética abdominal.",
    descripcion:
      "Fortalece tu core con rutinas específicas para abdomen, logrando un núcleo fuerte y definido.",
    duracionSemanas: 4,
    duracionLabel: "4 semanas (1 mes)",
    formato: "Digital",
    enfoque: "Hipertrofia abdominal con periodización en ciclos de técnica, volumen, intensidad y definición.",
    metodologia:
      "Ejercicios efectivos y variados con guía de activación muscular precisa, sin crunches genéricos.",
    extras: [
      "Videos explicativos",
      "Guía técnica incluida",
      "Nutrición y recuperación específica",
      "Protocolo de suplementación opcional",
    ],
    inversion: "$2000",
    precio: 2000,
    moneda: "UYU",
    presentacion: presentacionIvis,
  },
  {
    slug: "mami-fit",
    orden: 3,
    nombre: "Mami Fit",
    resumen:
      "Rutinas cortas y seguras para post-embarazo, estabilidad pélvica y recuperación abdominal.",
    descripcion:
      "Recupera tu core con rutinas diseñadas para madres, sin importar cuánto tiempo haya pasado desde el embarazo.",
    duracionSemanas: 8,
    duracionLabel: "8 semanas (2 meses)",
    formato: "Digital desde casa",
    enfoque: "Rehabilitación muscular completa y recuperación abdominal.",
    beneficios: [
      "Cierra la diástasis abdominal",
      "Fortalece el suelo pélvico",
      "Mejora la estabilidad postural",
      "Ayuda a eliminar y prevenir incontinencia de esfuerzo",
    ],
    extras: [
      "Ejercicios para hacer en casa todos los días",
      "Guía nutricional para madres",
      "Comunidad y soporte continuo",
    ],
    inversion: "$3000",
    precio: 3000,
    moneda: "UYU",
    presentacion: presentacionIvis,
  },
  {
    slug: "plan-100-online",
    orden: 4,
    nombre: "Plan 100% Online",
    resumen:
      "Plan mensual online con rutinas personalizadas, guía nutricional y soporte por app.",
    descripcion:
      "Acceso completo a la plataforma con rutinas adaptadas a tu nivel, objetivos y equipo disponible.",
    duracionSemanas: 4,
    duracionLabel: "4 semanas (1 mes)",
    formato: "100% Online",
    enfoque: "Entrenamiento personalizado para casa o gimnasio.",
    extras: [
      "Guía nutricional flexible y específica",
      "Videos explicativos de técnica",
      "Evaluación inicial con registro de progresos",
      "1 clase mensual online en vivo",
      "Soporte limitado vía App",
    ],
    inversion: "$2500 mensual",
    precio: 2500,
    moneda: "UYU",
    presentacion: presentacionIvis,
  },
  {
    slug: "plan-semi-presencial",
    orden: 5,
    nombre: "Plan Semi Presencial",
    resumen:
      "Plan mensual con 1 clase presencial semanal, rutinas personalizadas y soporte ilimitado.",
    descripcion:
      "Incluye una clase presencial por semana y rutinas adaptadas a tu nivel, objetivos y equipo disponible.",
    duracionSemanas: 4,
    duracionLabel: "4 semanas (1 mes)",
    formato: "Semi Presencial",
    enfoque: "Entrenamiento personalizado con acompañamiento presencial semanal.",
    extras: [
      "Plan alimenticio",
      "Videos explicativos",
      "Evaluación inicial y devolución de progresos",
      "Soporte ilimitado vía App",
    ],
    inversion: "$4000",
    precio: 4000,
    moneda: "UYU",
    presentacion: presentacionIvis,
  },
  {
    slug: "personalizado-presencial",
    orden: 6,
    nombre: "Entrenamiento Personalizado Presencial",
    resumen:
      "Entrenamiento presencial exclusivo con exigencia máxima, control total y atención diaria.",
    descripcion:
      "Entrenemos juntas en el lugar que te quede cómodo, con rutinas 100% personalizadas y resultados adaptados a tus objetivos.",
    duracionSemanas: 4,
    duracionLabel: "4 semanas (mensual)",
    formato: "Presencial",
    enfoque: "Atención presencial exclusiva y entrenamientos diarios.",
    extras: [
      "Plan alimenticio",
      "Guía técnica precisa",
      "Videos explicativos",
      "Control de progresos con devolución de seguimiento",
    ],
    inversion: "Precio a convenir según días y horarios",
    moneda: "UYU",
    presentacion: presentacionIvis,
  },
];

async function ensureDefaultPlanTemplates() {
  await Promise.all(
    defaultPlanTemplates.map((plan) =>
      PlanTemplate.updateOne(
        { slug: plan.slug },
        { $setOnInsert: plan },
        { upsert: true },
      ),
    ),
  );
}

export const planTemplatesService = {
  async list() {
    await ensureDefaultPlanTemplates();
    return PlanTemplate.find().sort({ orden: 1, nombre: 1 });
  },

  async getById(id: string) {
    const plan = await PlanTemplate.findById(id);
    return assertFound(plan, "Plan no encontrado");
  },

  async create(data: CreatePlanTemplateInput) {
    try {
      return await PlanTemplate.create(data);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un plan con ese identificador");
      }
      throw error;
    }
  },

  async update(id: string, data: UpdatePlanTemplateInput) {
    try {
      const plan = await PlanTemplate.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      assertFound(plan, "Plan no encontrado");

      let syncedRutinasCount = 0;
      if (data.blueprint?.challenge28 !== undefined) {
        const syncResult = await syncTemplateDayVideosToLinkedRutinas(
          id,
          plan.blueprint?.challenge28,
        );
        syncedRutinasCount = syncResult.updatedCount;
      }

      return { plan, syncedRutinasCount };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(409, "Ya existe un plan con ese identificador");
      }
      throw error;
    }
  },
};
