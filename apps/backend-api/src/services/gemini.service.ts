import type { ChatbotAnswers, ChatbotStep } from "@ivisfit/database";
import {
  buildConversationHistory,
  buildFallbackSummary,
  detectSmartExtras,
  getLatestConversationTurn,
  getPlanReason,
  getReplyStyleHint,
  type ConversationTurn,
} from "./chatbot-flow.js";
import { generateGeminiText, isGeminiConfigured } from "./gemini-client.js";

const SYSTEM_PROMPT = `Sos la asistente comercial de IVIIS FIT, una marca de entrenamiento para mujeres.
Tu tono es cálido, humano y cercano, como WhatsApp. Usás español rioplatense (vos, querés).
Nunca presionás a comprar antes de entender a la persona.
No inventés precios ni beneficios que no estén en el contexto.
Mantené mensajes cortos (1-2 oraciones antes de la pregunta, salvo el resumen final).
Usá emojis con moderación (1-2 por mensaje).
Hablá en femenino hacia la usuaria cuando el género es mujer; si es hombre, adaptá el trato sin perder calidez.
SIEMPRE terminá con la pregunta del paso actual, copiada textualmente cuando se indique.
Saludá por nombre solo en el primer mensaje personalizado (justo después de conocer el nombre). En el resto de los pasos NO digas "Hola", NO repitas el nombre al inicio ni vuelvas a saludar.
Variá el inicio de cada mensaje. PROHIBIDO empezar con muletillas repetidas como "Entiendo", "Perfecto", "Genial", "Qué bueno", "Claro" o "Me alegra".
Si no hay nada específico que agregar, andá directo a la pregunta sin frase de relleno.`;

type GeminiContext = {
  instruction: string;
  answers?: ChatbotAnswers;
  conversationHistory?: ConversationTurn[];
  planTitle?: string;
  planReason?: string;
  catalogSnippet?: string;
  extras?: string[];
  temperature?: number;
  maxOutputTokens?: number;
  requiredSubstring?: string;
};

function formatHistory(history: ConversationTurn[]): string {
  if (history.length === 0) return "";
  return history
    .map((turn) => `P: ${turn.question}\nR: ${turn.answer}`)
    .join("\n\n");
}

function buildUserPrompt(ctx: GeminiContext) {
  const parts = [ctx.instruction];

  if (ctx.conversationHistory?.length) {
    parts.push(`Historial reciente de la conversación:\n${formatHistory(ctx.conversationHistory)}`);
  }
  if (ctx.answers) {
    parts.push(`Datos acumulados de la evaluación: ${JSON.stringify(ctx.answers)}`);
  }
  if (ctx.planTitle) {
    parts.push(`Plan recomendado (NO cambiar): ${ctx.planTitle}`);
  }
  if (ctx.planReason) {
    parts.push(`Razón del plan (usar como base): ${ctx.planReason}`);
  }
  if (ctx.catalogSnippet) {
    parts.push(`Catálogo de planes:\n${ctx.catalogSnippet}`);
  }
  if (ctx.extras?.length) {
    parts.push(`Mensajes extra a incluir de forma natural:\n- ${ctx.extras.join("\n- ")}`);
  }

  return parts.join("\n\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripRepeatedGreeting(text: string, nombre?: string): string {
  let result = text.trim();

  if (nombre) {
    const namePattern = new RegExp(
      `^¡?\\s*Hola,?\\s+${escapeRegExp(nombre)}[!.,]?\\s*`,
      "i",
    );
    result = result.replace(namePattern, "").trim();
  }

  result = result.replace(/^¡?\s*Hola[!.,]?\s*/i, "").trim();
  return result;
}

const GENERIC_OPENERS = [
  /^Entiendo[,!.]?\s*/i,
  /^Perfecto[,!.]?\s*/i,
  /^Genial[,!.]?\s*/i,
  /^Qué bueno[,!.]?\s*/i,
  /^Claro[,!.]?\s*/i,
  /^Me alegra[,!.]?\s*/i,
  /^Excelente[,!.]?\s*/i,
];

function stripGenericOpeners(text: string): string {
  let result = text.trim();
  for (const pattern of GENERIC_OPENERS) {
    if (pattern.test(result)) {
      result = result.replace(pattern, "").trim();
      break;
    }
  }
  return result;
}

function polishStepReply(text: string, nombre?: string): string {
  return stripGenericOpeners(stripRepeatedGreeting(text, nombre));
}

async function generateText(ctx: GeminiContext, fallback: string): Promise<string> {
  return generateGeminiText({
    instruction: buildUserPrompt(ctx),
    systemInstruction: SYSTEM_PROMPT,
    fallback,
    maxOutputTokens: ctx.maxOutputTokens ?? 1024,
    temperature: ctx.temperature ?? 0.4,
    requiredSubstring: ctx.requiredSubstring,
    logLabel: "gemini.service",
  });
}

export const geminiService = {
  isConfigured() {
    return isGeminiConfigured();
  },

  async polishGreeting(fallback: string) {
    // El saludo de apertura debe ser literal; no lo reescribimos.
    return fallback;
  },

  async enhanceStepReply(
    step: ChatbotStep,
    question: string,
    answers: ChatbotAnswers,
    fallback: string,
  ) {
    const extras = detectSmartExtras(answers);
    const history = buildConversationHistory(answers, 3);
    const latestTurn = getLatestConversationTurn(answers);
    const isFirstPersonalizedStep = step === "genero";
    const genderHint =
      answers.genero === "hombre"
        ? "Usá lenguaje inclusivo o masculino cuando corresponda."
        : answers.genero === "mujer"
          ? "Usá lenguaje inclusivo o femenino cuando corresponda."
          : "Usá lenguaje inclusivo (o/a) cuando corresponda.";

    const greetingRule = isFirstPersonalizedStep
      ? `Podés saludar brevemente por nombre una sola vez (ej: "¡Hola ${answers.nombre ?? ""}! Un gusto.").`
      : `NO saludes ni repitas el nombre. Reaccioná de forma concreta a lo que acaba de responder.`;

    const latestAnswerLine = latestTurn
      ? `Última respuesta de la persona: "${latestTurn.answer}" (a la pregunta "${latestTurn.question}").`
      : "";

    const reply = await generateText(
      {
        instruction: `La persona acaba de responder. ${greetingRule}
${latestAnswerLine}
${genderHint}
Estilo para este mensaje: ${getReplyStyleHint(step)}
Escribí como máximo UNA frase breve y distinta antes de la pregunta. Evitá muletillas ya usadas en chats similares.
Luego hacé EXACTAMENTE esta pregunta (sin cambiar palabras, sin agregar opciones ni listas): "${question}"
No agregues preguntas adicionales, selectores, chips ni menús. No inventes opciones de respuesta.`,
        answers,
        conversationHistory: history,
        extras: extras.length > 0 ? extras : undefined,
        temperature: 0.62,
        maxOutputTokens: 1024,
        requiredSubstring: question,
      },
      fallback,
    );

    if (isFirstPersonalizedStep) return stripGenericOpeners(reply);
    return polishStepReply(reply, answers.nombre);
  },

  async buildSummary(
    answers: ChatbotAnswers,
    planTitle: string,
    planSlug: string,
    catalogSnippet: string,
  ) {
    const planReason = getPlanReason(planSlug, answers);
    const fallback = buildFallbackSummary(answers, planTitle, planReason);
    const extras = detectSmartExtras(answers);
    const history = buildConversationHistory(answers, 5);

    return generateText(
      {
        instruction: `Generá el resumen final de evaluación. Estructura:
1. "Perfecto, [nombre]. Esto fue lo que entendí de vos:" con bullets ✔️
2. "Según todo lo que me contaste, creo que el plan que mejor se adapta a vos es: [plan]"
3. Explicá brevemente por qué (1-2 oraciones)
NO agregues CTAs de compra todavía. NO cambies el plan recomendado.`,
        answers,
        conversationHistory: history,
        planTitle,
        planReason,
        catalogSnippet,
        extras,
        temperature: 0.7,
        maxOutputTokens: 2048,
        requiredSubstring: planTitle,
      },
      fallback,
    );
  },
};
