import {
  ChatbotLead,
  type ChatbotAnswers,
  type ChatbotStep,
  type ChatbotTurnInput,
  type UpsertChatbotLeadInput,
} from "@ivisfit/database";
import { AppError } from "../utils/errors.js";
import { landingPlanesService } from "./landing-planes.service.js";
import { recommendPlanSlug } from "./chatbot-recommendation.js";
import {
  GREETING_MESSAGE,
  STEP_OPTIONS,
  getNextStep,
  getPlanDisplayName,
  type ChipOption,
} from "./chatbot-flow.js";
import { geminiService } from "./gemini.service.js";
import { createJob } from "./job-registry.js";
import { buildWhatsAppEvaluationLink } from "../lib/whatsapp.js";

export type ChatbotTurnResponse = {
  assistantMessage: string;
  nextStep: ChatbotStep;
  inputType: "none" | "text" | "chips" | "multi-chips";
  options?: ChipOption[];
  placeholder?: string;
  recommendedPlan?: {
    slug: string;
    title: string;
    shortTitle: string;
    route: string;
    displayName: string;
    investment: string;
  };
  leadId?: string;
  resumenTexto?: string;
  showCtAs?: boolean;
  processing?: boolean;
  jobId?: string;
};

function normalizeAnswers(answers: ChatbotAnswers): ChatbotAnswers {
  return {
    ...answers,
    nombre: answers.nombre?.trim(),
    email: answers.email?.trim(),
    whatsapp: answers.whatsapp?.trim(),
    motivoAbandono: answers.motivoAbandono?.trim(),
  };
}

function validateUserInput(
  step: ChatbotStep,
  userInput: string | string[] | undefined,
): string | string[] {
  if (step === "greeting" || step === "resumen" || step === "done") {
    return "";
  }

  const config = STEP_OPTIONS[step as keyof typeof STEP_OPTIONS];
  if (!config) {
    throw new AppError(400, "Paso de evaluación inválido");
  }

  if (config.inputType === "text") {
    const value = typeof userInput === "string" ? userInput.trim() : "";
    if (!value) {
      throw new AppError(400, "Necesito una respuesta para continuar");
    }
    if (step === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new AppError(400, "El mail no parece válido");
    }
    return value;
  }

  if (config.inputType === "multi-chips") {
    const values = Array.isArray(userInput)
      ? userInput
      : typeof userInput === "string"
        ? [userInput]
        : [];
    if (values.length === 0) {
      throw new AppError(400, "Elegí al menos una opción");
    }
    if (values.includes("ninguno")) {
      return ["ninguno"];
    }
    return values;
  }

  const value = typeof userInput === "string" ? userInput : userInput?.[0];
  if (!value) {
    throw new AppError(400, "Elegí una opción para continuar");
  }

  const validValues = config.options?.map((o) => o.value) ?? [];
  if (!validValues.includes(value)) {
    throw new AppError(400, "Opción inválida");
  }

  return value;
}

function applyAnswer(
  answers: ChatbotAnswers,
  step: ChatbotStep,
  userInput: string | string[],
): ChatbotAnswers {
  const next = { ...answers };

  switch (step) {
    case "nombre":
      next.nombre = userInput as string;
      break;
    case "genero":
      next.genero = userInput as string;
      break;
    case "objetivo":
      next.objetivo = userInput as string;
      break;
    case "entrenamiento":
      next.nivel = userInput as string;
      break;
    case "motivoAbandono":
      next.motivoAbandono = userInput as string;
      break;
    case "diasSemana":
      next.diasSemana = userInput as string;
      break;
    case "tiempoSesion":
      next.tiempoSesion = userInput as string;
      break;
    case "lugar":
      next.lugar = userInput as string;
      break;
    case "materiales":
      next.materiales = userInput as string[];
      break;
    case "alimentacion":
      next.alimentacion = userInput as string;
      break;
    case "obstaculo":
      next.obstaculo = userInput as string;
      break;
    case "confianza":
      next.confianza = Number(userInput);
      break;
    case "email":
      next.email = userInput as string;
      break;
    case "whatsapp":
      next.whatsapp = userInput as string;
      break;
    case "fuente":
      next.fuente = userInput as string;
      break;
    default:
      break;
  }

  return normalizeAnswers(next);
}

async function buildStepResponse(
  step: ChatbotStep,
  answers: ChatbotAnswers,
): Promise<ChatbotTurnResponse> {
  if (step === "resumen" || step === "done") {
    const slug = recommendPlanSlug(answers);
    const plan = await landingPlanesService.getByIdOrSlug(slug);
    const displayName = getPlanDisplayName(plan.slug, plan.shortTitle);
    const catalog = await landingPlanesService.listPublic();
    const catalogSnippet = catalog
      .map((p) => `- ${p.shortTitle} (${p.slug}): ${p.subtitle}`)
      .join("\n");

    const resumenTexto = await geminiService.buildSummary(
      answers,
      displayName,
      plan.slug,
      catalogSnippet,
    );

    const ctaMessage = `Podés hacer cualquiera de estas dos cosas:

🟡 Comprar el plan ahora.
🟢 Hablar con Ivis por WhatsApp si querés que revise tu caso antes de decidir.`;

    return {
      assistantMessage: `${resumenTexto}\n\n${ctaMessage}`,
      nextStep: "done",
      inputType: "none",
      recommendedPlan: {
        slug: plan.slug,
        title: plan.title,
        shortTitle: plan.shortTitle,
        route: plan.route,
        displayName,
        investment: plan.investment,
      },
      resumenTexto,
      showCtAs: true,
    };
  }

  const config = STEP_OPTIONS[step as keyof typeof STEP_OPTIONS];
  if (!config) {
    throw new AppError(400, "Paso de evaluación inválido");
  }

  let assistantMessage = config.question;

  // Nombre es siempre texto libre: no reescribir ni anteponer selectores.
  if (step !== "nombre") {
    assistantMessage = await geminiService.enhanceStepReply(
      step,
      config.question,
      answers,
      config.question,
    );
  }

  return {
    assistantMessage,
    nextStep: step,
    inputType: config.inputType,
    options: config.options,
    placeholder: config.placeholder,
  };
}

async function upsertLeadFromAnswers(
  sessionId: string,
  answers: ChatbotAnswers,
  extra?: Partial<UpsertChatbotLeadInput>,
) {
  const payload: UpsertChatbotLeadInput = {
    sessionId,
    nombre: answers.nombre,
    genero: answers.genero,
    email: answers.email,
    whatsapp: answers.whatsapp,
    fuente: answers.fuente,
    objetivo: answers.objetivo,
    nivel: answers.nivel,
    motivoAbandono: answers.motivoAbandono,
    diasSemana: answers.diasSemana,
    tiempoSesion: answers.tiempoSesion,
    lugar: answers.lugar,
    materiales: answers.materiales,
    alimentacion: answers.alimentacion,
    obstaculo: answers.obstaculo,
    confianza: answers.confianza,
    status: extra?.status ?? "incomplete",
    ...extra,
  };

  const lead = await ChatbotLead.findOneAndUpdate(
    { sessionId },
    { $set: payload, $setOnInsert: { fecha: new Date() } },
    { upsert: true, new: true, runValidators: true },
  );

  return lead;
}

async function buildSummaryTurn(
  sessionId: string,
  answers: ChatbotAnswers,
): Promise<ChatbotTurnResponse> {
  const summaryResponse = await buildStepResponse("resumen", answers);
  const lead = await upsertLeadFromAnswers(sessionId, answers, {
    planRecomendadoSlug: summaryResponse.recommendedPlan?.slug,
    planRecomendadoTitulo: summaryResponse.recommendedPlan?.displayName,
    resumenTexto: summaryResponse.resumenTexto,
    status: "completed",
  });
  return { ...summaryResponse, leadId: lead._id.toString() };
}

export const chatbotService = {
  async processTurn(input: ChatbotTurnInput): Promise<ChatbotTurnResponse> {
    const { sessionId, step, userInput } = input;
    let answers = normalizeAnswers(input.answers);

    if (step === "greeting") {
      await upsertLeadFromAnswers(sessionId, answers);

      return {
        assistantMessage: `${GREETING_MESSAGE}\n\n${STEP_OPTIONS.nombre.question}`,
        nextStep: "nombre",
        inputType: "text",
        placeholder: STEP_OPTIONS.nombre.placeholder,
      };
    }

    if (userInput !== undefined) {
      const validated = validateUserInput(step, userInput);
      answers = applyAnswer(answers, step, validated);
      await upsertLeadFromAnswers(sessionId, answers);
    } else if (step !== "resumen" && step !== "done") {
      return buildStepResponse(step, answers);
    }

    const nextStep = getNextStep(step, answers);

    if (nextStep === "resumen") {
      // La generación del resumen tarda más que el timeout de la función
      // serverless del frontend (Netlify). Se ejecuta en background y el
      // cliente consulta el estado por jobId.
      const job = createJob(() => buildSummaryTurn(sessionId, answers));
      return {
        assistantMessage: "",
        processing: true,
        jobId: job.jobId,
        nextStep: "resumen",
        inputType: "none",
      };
    }

    if (nextStep === "done") {
      return {
        assistantMessage: "¡Gracias por tu tiempo! Cualquier duda, acá estoy 💛",
        nextStep: "done",
        inputType: "none",
      };
    }

    return buildStepResponse(nextStep, answers);
  },

  async upsertLead(input: UpsertChatbotLeadInput) {
    const lead = await ChatbotLead.findOneAndUpdate(
      { sessionId: input.sessionId },
      { $set: input, $setOnInsert: { fecha: new Date() } },
      { upsert: true, new: true, runValidators: true },
    );
    return lead;
  },

  async listLeads(query: {
    status?: string;
    fuente?: string;
    plan?: string;
    desde?: string;
    hasta?: string;
  }) {
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.fuente) filter.fuente = query.fuente;
    if (query.plan) filter.planRecomendadoSlug = query.plan;
    if (query.desde || query.hasta) {
      filter.createdAt = {};
      if (query.desde) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(query.desde);
      }
      if (query.hasta) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(query.hasta);
      }
    }

    const leads = await ChatbotLead.find(filter).sort({ createdAt: -1 }).limit(200);
    return leads;
  },

  async getLeadById(id: string) {
    const lead = await ChatbotLead.findById(id);
    if (!lead) {
      throw new AppError(404, "Lead no encontrado");
    }
    return lead;
  },

  async setContactada(id: string, contactada: boolean) {
    const lead = await ChatbotLead.findByIdAndUpdate(
      id,
      { $set: { contactada } },
      { new: true },
    );
    if (!lead) {
      throw new AppError(404, "Lead no encontrado");
    }
    return lead;
  },

  buildWhatsAppLink(resumenTexto: string, planTitle: string, nombre?: string) {
    return buildWhatsAppEvaluationLink({
      resumenTexto,
      planName: planTitle,
      nombre,
    });
  },
};
