import { generateGeminiText, isGeminiConfigured } from "./gemini-client.js";

export const ESCALATION_REPLY =
  "Creo que esta situación merece una atención más personalizada. Si te parece, escribile directamente a Ivis por WhatsApp y lo vemos juntas.";

const SYSTEM_PROMPT = `Sos la entrenadora de acompañamiento de IVIIS FIT dentro de la app.
No vendés. Acompañás. Sos prácticamente una entrenadora disponible las 24 horas.
Hablás parecido a Ivis: cálida, cercana, en español rioplatense (vos, querés), en femenino hacia la usuaria.

Tu trabajo:
- Resolver dudas de entrenamiento y alimentación con base en el contexto de la alumna.
- Sostener la motivación sin mandar ni juzgar.
- Celebrar logros y constancia.
- Derivar a Ivis cuando el caso lo merezca.

Motivación (importante):
- NUNCA digas solo "debés entrenar".
- Validá el sentimiento, ofrecé un paso chico y preguntá.
Ejemplo si dice "No tengo ganas de entrenar":
"Es totalmente normal tener días así. No necesitás hacer una rutina perfecta. ¿Qué te parece si hoy hacés solamente el calentamiento? Muchas veces empezar es la parte más difícil."
Ejemplo si dice "No veo resultados":
"Contame… ¿Hace cuánto empezaste? ¿Cuántos entrenamientos completaste esta semana? ¿Cómo venís con la alimentación? A veces los cambios más importantes todavía no se ven en el espejo, pero sí en la fuerza, la energía y la constancia."

Reglas:
- Basate SIEMPRE en el contexto de la alumna. No inventes datos que no estén ahí.
- Nunca diagnostiques lesiones, temas médicos, embarazo, trastornos alimenticios, depresión ni ansiedad.
- Si hay alerta de derivación, respondé SOLO con empatía breve y derivá a Ivis. No des consejos médicos ni de alimentación en ese caso.
- Respuestas cortas y prácticas (2-5 oraciones), emojis con moderación.
- Si la categoría es entrenamiento/alimentación/motivación/progreso, priorizá ese tema.
- Saludá una sola vez por conversación. La app ya muestra el saludo inicial, así que NUNCA vuelvas a saludar ni a presentarte, ni siquiera en el primer mensaje.
- No uses el nombre de la alumna para abrir tus respuestas ni lo repitas en cada mensaje. Mencionalo solo si aporta naturalidad en el medio de una respuesta.
- Respondé directo al mensaje, sin aperturas fijas. No empieces con "Entiendo.", "Claro", "Perfecto", "¡Hola!" ni repitas la misma frase de apertura en cada turno. Variá tu forma de responder.
- Si la usuaria agradece o cierra el tema, respondé breve y cerrá; no reinicies la conversación ni preguntes otra vez lo mismo.`;

const ESCALATION_KEYWORDS = [
  "dolor",
  "duele",
  "lesion",
  "lesión",
  "lastim",
  "desgarr",
  "embarazo",
  "embarazada",
  "encinta",
  "anorexia",
  "bulimia",
  "trastorno aliment",
  "no quiero comer",
  "vomito",
  "vómito",
  "atracón",
  "atracon",
  "no doy mas",
  "no doy más",
  "quiero rendirme",
  "no aguanto mas",
  "no aguanto más",
  "muy triste",
  "depre",
  "depresion",
  "depresión",
  "ansiedad",
  "ataque de panico",
  "ataque de pánico",
  "autolesion",
  "autolesión",
];

export type AssistantContext = {
  nombre?: string;
  objetivo?: string;
  restricciones?: string[];
  rutinaResumen?: string;
  ejerciciosResumen?: string;
  cumplimientoResumen?: string;
  logrosResumen?: string;
  planNutricionalResumen?: string;
  pesoResumen?: string;
  comunidadHoy?: number;
};

export type AssistantHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

function buildContextBlock(context: AssistantContext) {
  const lines: string[] = [];
  if (context.nombre) lines.push(`Nombre: ${context.nombre}`);
  if (context.objetivo) lines.push(`Objetivo: ${context.objetivo}`);
  if (context.restricciones?.length) {
    lines.push(`Restricciones/alergias: ${context.restricciones.join(", ")}`);
  }
  if (context.rutinaResumen) lines.push(`Rutina activa: ${context.rutinaResumen}`);
  if (context.ejerciciosResumen) {
    lines.push(`Ejercicios de su plan: ${context.ejerciciosResumen}`);
  }
  if (context.cumplimientoResumen) {
    lines.push(`Cumplimiento de entrenamiento: ${context.cumplimientoResumen}`);
  }
  if (context.logrosResumen) lines.push(`Logros: ${context.logrosResumen}`);
  if (context.planNutricionalResumen) {
    lines.push(`Plan de alimentación: ${context.planNutricionalResumen}`);
  }
  if (context.pesoResumen) lines.push(`Peso corporal: ${context.pesoResumen}`);
  if (typeof context.comunidadHoy === "number") {
    lines.push(`Alumnas que entrenaron hoy: ${context.comunidadHoy}`);
  }
  return lines.join("\n");
}

export function detectEscalation(mensaje: string): boolean {
  const lower = mensaje.toLowerCase();
  return ESCALATION_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export const assistantGeminiService = {
  isConfigured() {
    return isGeminiConfigured();
  },

  async chat(
    mensaje: string,
    context: AssistantContext,
    escalated: boolean,
    history: AssistantHistoryMessage[],
    categoria?: string,
  ) {
    const fallback = escalated
      ? ESCALATION_REPLY
      : "Por ahora no tengo una respuesta para eso, pero podés consultarlo directamente con Ivis. ¿Te ayudo con algo de tu rutina o tu plan de alimentación?";

    if (escalated) return ESCALATION_REPLY;

    const contextBlock = buildContextBlock(context);
    const historyBlock = history
      .slice(-8)
      .map((m) => `${m.role === "user" ? "Alumna" : "Asistente"}: ${m.content}`)
      .join("\n");

    const categoriaLine = categoria
      ? `Categoría activa del menú: ${categoria}.\n\n`
      : "";

    const instruction = `${contextBlock ? `Contexto de la alumna:\n${contextBlock}\n\n` : ""}${
      historyBlock ? `Conversación reciente:\n${historyBlock}\n\n` : ""
    }${categoriaLine}Mensaje de la alumna: ${mensaje}`;

    return generateGeminiText({
      instruction,
      systemInstruction: SYSTEM_PROMPT,
      fallback,
      temperature: 0.8,
      maxOutputTokens: 1024,
      logLabel: "assistant-gemini",
    });
  },
};
