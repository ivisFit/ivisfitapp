import { generateGeminiText } from "./gemini-client.js";

export type CoachPerfilTono =
  | "motivacion"
  | "organizacion"
  | "recordatorio"
  | "celebracion";

const PERFIL_INSTRUCCION: Record<CoachPerfilTono, string> = {
  motivacion:
    "Tono de apoyo y motivación, sin culpa ni presión. Invitala a dar un paso chico hoy.",
  organizacion:
    "Tono práctico y organizativo: ayudala a simplificar con un paso concreto y realista.",
  recordatorio:
    "Tono breve y amable de recordatorio suave, sin dramatizar.",
  celebracion:
    "Tono de felicitación concreta y cálida por el logro; celebrá el esfuerzo.",
};

const SYSTEM_PROMPT_BASE = `Sos el coach de progreso de IVIIS FIT.
Tu única tarea es redactar UN mensaje corto (1-2 oraciones) para una alumna, a partir de un hecho objetivo que te paso sobre su comportamiento en la app.
Hablás en español rioplatense (vos, querés), en femenino hacia la usuaria.
No inventes datos que no estén en el hecho que te paso. No dés consejos médicos ni nutricionales específicos.
Devolvé SOLO el mensaje final, sin comillas ni explicaciones adicionales.`;

export const coachGeminiService = {
  async redactar(
    hecho: string,
    fallback: string,
    perfil: CoachPerfilTono = "motivacion",
  ) {
    return generateGeminiText({
      instruction: `Hecho: ${hecho}`,
      systemInstruction: `${SYSTEM_PROMPT_BASE}\nPerfil de tono: ${PERFIL_INSTRUCCION[perfil]}`,
      fallback,
      temperature: 0.7,
      maxOutputTokens: 200,
      logLabel: "coach-gemini",
    });
  },
};
