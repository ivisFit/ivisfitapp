import type { ChatbotAnswers, ChatbotStep } from "@ivisfit/database";

export type ChipOption = {
  value: string;
  label: string;
};

export type StepConfig = {
  question: string;
  inputType: "none" | "text" | "chips" | "multi-chips";
  options?: ChipOption[];
  placeholder?: string;
};

export const GREETING_MESSAGE = `Hola 😊
Soy el asistente de IVIIS FIT.
Antes de recomendarte un plan quiero conocerte un poquito.
Me lleva menos de 3 minutos.`;

export const STEP_OPTIONS: Record<Exclude<ChatbotStep, "greeting" | "resumen" | "done">, StepConfig> = {
  nombre: {
    question: "¿Cómo te llamás?",
    inputType: "text",
    placeholder: "Tu nombre",
  },
  genero: {
    question: "¿Cuál es tu género?",
    inputType: "chips",
    options: [
      { value: "mujer", label: "Mujer" },
      { value: "hombre", label: "Hombre" },
    ],
  },
  objetivo: {
    question: "¿Qué te gustaría lograr?",
    inputType: "chips",
    options: [
      { value: "bajar_grasa", label: "Bajar grasa" },
      { value: "ganar_masa", label: "Ganar masa muscular" },
      { value: "tonificar", label: "Tonificar" },
      { value: "mejorar_salud", label: "Mejorar salud" },
      { value: "recuperar_rutina", label: "Recuperar la rutina" },
      { value: "competir", label: "Prepararme para competir" },
      { value: "otro", label: "Otro" },
    ],
  },
  entrenamiento: {
    question: "Actualmente...",
    inputType: "chips",
    options: [
      { value: "nunca", label: "Nunca entrené" },
      { value: "a_veces", label: "Entreno a veces" },
      { value: "seguido", label: "Entreno seguido" },
      { value: "volviendo", label: "Estoy volviendo" },
    ],
  },
  motivoAbandono: {
    question: "¿Por qué dejaste? (Podés contarme con tus palabras)",
    inputType: "text",
    placeholder: 'Ej: "No tenía tiempo", "Perdí motivación", "Fui mamá"...',
  },
  diasSemana: {
    question: "¿Cuántos días por semana realmente podés entrenar?",
    inputType: "chips",
    options: [
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6+", label: "6+" },
    ],
  },
  tiempoSesion: {
    question: "¿Cuánto tiempo por sesión?",
    inputType: "chips",
    options: [
      { value: "20", label: "20 min" },
      { value: "30", label: "30 min" },
      { value: "45", label: "45 min" },
      { value: "60", label: "1 hora" },
      { value: "60+", label: "Más de 1 hora" },
    ],
  },
  lugar: {
    question: "¿Dónde querés entrenar?",
    inputType: "chips",
    options: [
      { value: "casa", label: "Casa" },
      { value: "gym", label: "Gym" },
      { value: "ambos", label: "Ambos" },
    ],
  },
  materiales: {
    question: "¿Qué tenés disponible? (Podés elegir varios)",
    inputType: "multi-chips",
    options: [
      { value: "ninguno", label: "Ninguno" },
      { value: "bandas", label: "Bandas" },
      { value: "mancuernas", label: "Mancuernas" },
      { value: "barra", label: "Barra" },
      { value: "maquinas", label: "Máquinas" },
      { value: "gym_completo", label: "Gym completo" },
    ],
  },
  alimentacion: {
    question: "¿Querés ayuda también con la alimentación?",
    inputType: "chips",
    options: [
      { value: "si", label: "Sí" },
      { value: "no", label: "No" },
      { value: "no_se", label: "Todavía no sé" },
    ],
  },
  obstaculo: {
    question: "¿Qué sentís que hoy te cuesta más?",
    inputType: "chips",
    options: [
      { value: "tiempo", label: "No tengo tiempo" },
      { value: "motivacion", label: "No tengo motivación" },
      { value: "abandono", label: "Empiezo y abandono" },
      { value: "no_entrenar", label: "No sé entrenar" },
      { value: "no_comer", label: "No sé comer" },
      { value: "sola", label: "Me siento sola/o" },
      { value: "acompanamiento", label: "Necesito alguien que me acompañe" },
    ],
  },
  confianza: {
    question: "¿Qué tan segura/o te sentís de poder cumplir un plan?",
    inputType: "chips",
    options: [
      { value: "1", label: "1 · Nada" },
      { value: "2", label: "2" },
      { value: "3", label: "3 · Más o menos" },
      { value: "4", label: "4" },
      { value: "5", label: "5 · Muy segura/o" },
    ],
  },
  email: {
    question: "¿Cuál es tu mail? (Para enviarte info si querés)",
    inputType: "text",
    placeholder: "tu@email.com",
  },
  whatsapp: {
    question: "¿Tu WhatsApp? (Así Ivis puede escribirte si lo necesitás)",
    inputType: "text",
    placeholder: "Ej: 09X XXX XXX",
  },
  fuente: {
    question: "¿Cómo llegaste a IVIIS FIT?",
    inputType: "chips",
    options: [
      { value: "instagram", label: "Instagram" },
      { value: "google", label: "Google" },
      { value: "facebook", label: "Facebook" },
      { value: "amiga", label: "Una amiga me recomendó" },
      { value: "otro", label: "Otro" },
    ],
  },
};

const LABEL_MAP: Record<string, Record<string, string>> = {
  genero: {
    mujer: "Mujer",
    hombre: "Hombre",
  },
  objetivo: Object.fromEntries(
    STEP_OPTIONS.objetivo.options!.map((o) => [o.value, o.label]),
  ),
  entrenamiento: Object.fromEntries(
    STEP_OPTIONS.entrenamiento.options!.map((o) => [o.value, o.label]),
  ),
  diasSemana: Object.fromEntries(
    STEP_OPTIONS.diasSemana.options!.map((o) => [o.value, o.label]),
  ),
  tiempoSesion: Object.fromEntries(
    STEP_OPTIONS.tiempoSesion.options!.map((o) => [o.value, o.label]),
  ),
  lugar: Object.fromEntries(
    STEP_OPTIONS.lugar.options!.map((o) => [o.value, o.label]),
  ),
  materiales: Object.fromEntries(
    STEP_OPTIONS.materiales.options!.map((o) => [o.value, o.label]),
  ),
  alimentacion: Object.fromEntries(
    STEP_OPTIONS.alimentacion.options!.map((o) => [o.value, o.label]),
  ),
  obstaculo: Object.fromEntries(
    STEP_OPTIONS.obstaculo.options!.map((o) => [o.value, o.label]),
  ),
  fuente: Object.fromEntries(
    STEP_OPTIONS.fuente.options!.map((o) => [o.value, o.label]),
  ),
};

export function labelFor(field: keyof typeof LABEL_MAP, value: string) {
  return LABEL_MAP[field]?.[value] ?? value;
}

export function labelMateriales(values: string[]) {
  return values.map((v) => labelFor("materiales", v)).join(", ");
}

export function shouldSkipMotivoAbandono(answers: ChatbotAnswers) {
  return answers.nivel === "nunca" || answers.nivel === "seguido";
}

export type ConversationTurn = {
  step: string;
  question: string;
  answer: string;
};

const HISTORY_STEP_ORDER: Array<{
  step: keyof typeof STEP_OPTIONS | "entrenamiento";
  answerKey: keyof ChatbotAnswers;
  field?: "entrenamiento";
}> = [
  { step: "nombre", answerKey: "nombre" },
  { step: "genero", answerKey: "genero" },
  { step: "objetivo", answerKey: "objetivo" },
  { step: "entrenamiento", answerKey: "nivel", field: "entrenamiento" },
  { step: "motivoAbandono", answerKey: "motivoAbandono" },
  { step: "diasSemana", answerKey: "diasSemana" },
  { step: "tiempoSesion", answerKey: "tiempoSesion" },
  { step: "lugar", answerKey: "lugar" },
  { step: "materiales", answerKey: "materiales" },
  { step: "alimentacion", answerKey: "alimentacion" },
  { step: "obstaculo", answerKey: "obstaculo" },
  { step: "confianza", answerKey: "confianza" },
  { step: "email", answerKey: "email" },
  { step: "whatsapp", answerKey: "whatsapp" },
  { step: "fuente", answerKey: "fuente" },
];

function formatAnswerValue(
  step: keyof typeof STEP_OPTIONS | "entrenamiento",
  value: unknown,
): string {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) {
    return labelMateriales(value);
  }
  if (step === "entrenamiento" || step === "objetivo" || step === "diasSemana" ||
      step === "tiempoSesion" || step === "lugar" || step === "alimentacion" ||
      step === "obstaculo" || step === "fuente" || step === "genero") {
    const field = step === "entrenamiento" ? "entrenamiento" : step;
    if (field in LABEL_MAP) {
      return labelFor(field as keyof typeof LABEL_MAP, String(value));
    }
  }
  if (step === "genero") {
    return value === "mujer" ? "Mujer" : value === "hombre" ? "Hombre" : String(value);
  }
  return String(value);
}

export function buildConversationHistory(
  answers: ChatbotAnswers,
  limit = 3,
): ConversationTurn[] {
  const history: ConversationTurn[] = [];

  for (const entry of HISTORY_STEP_ORDER) {
    const raw = answers[entry.answerKey];
    if (raw === undefined || raw === null || raw === "") continue;
    if (Array.isArray(raw) && raw.length === 0) continue;

    const stepKey = entry.field ?? entry.step;
    const config = STEP_OPTIONS[stepKey as keyof typeof STEP_OPTIONS];
    if (!config) continue;

    const answer = formatAnswerValue(stepKey, raw);
    if (!answer) continue;

    history.push({
      step: entry.step,
      question: config.question,
      answer,
    });
  }

  return history.slice(-limit);
}

const CHATBOT_STEP_FLOW: ChatbotStep[] = [
  "greeting",
  "nombre",
  "genero",
  "objetivo",
  "entrenamiento",
  "motivoAbandono",
  "diasSemana",
  "tiempoSesion",
  "lugar",
  "materiales",
  "alimentacion",
  "obstaculo",
  "confianza",
  "email",
  "whatsapp",
  "fuente",
  "resumen",
  "done",
];

const REPLY_STYLE_HINTS = [
  "Podés ir casi directo a la pregunta, con una transición muy corta (máx. 5 palabras) o sin transición.",
  "Reaccioná con una observación concreta sobre su última respuesta, sin muletillas.",
  "Validá con palabras distintas a 'Entiendo' o 'Perfecto' (ej: 'Tiene sentido', 'Me queda claro', 'Buenísimo').",
  "Conectá su respuesta con lo que vas a preguntar en una sola frase natural.",
  "Motivá o acompañá brevemente según lo que respondió, con vocabulario distinto al paso anterior.",
];

export function getLatestConversationTurn(
  answers: ChatbotAnswers,
): ConversationTurn | null {
  const history = buildConversationHistory(answers, 99);
  return history.at(-1) ?? null;
}

export function getReplyStyleHint(step: ChatbotStep): string {
  const index = CHATBOT_STEP_FLOW.indexOf(step);
  return REPLY_STYLE_HINTS[(index < 0 ? 0 : index) % REPLY_STYLE_HINTS.length];
}

export function getNextStep(
  currentStep: ChatbotStep,
  answers: ChatbotAnswers,
): ChatbotStep {
  const flow: ChatbotStep[] = [
    "greeting",
    "nombre",
    "genero",
    "objetivo",
    "entrenamiento",
    "motivoAbandono",
    "diasSemana",
    "tiempoSesion",
    "lugar",
    "materiales",
    "alimentacion",
    "obstaculo",
    "confianza",
    "email",
    "whatsapp",
    "fuente",
    "resumen",
    "done",
  ];

  let index = flow.indexOf(currentStep);
  if (index === -1) return "done";

  while (index < flow.length - 1) {
    index += 1;
    const candidate = flow[index];
    if (candidate === "motivoAbandono" && shouldSkipMotivoAbandono(answers)) {
      continue;
    }
    return candidate;
  }

  return "done";
}

export function buildSummaryBullets(answers: ChatbotAnswers) {
  const bullets: string[] = [];

  if (answers.genero) {
    bullets.push(`Género: ${labelFor("genero", answers.genero)}`);
  }
  if (answers.objetivo) {
    bullets.push(`Querés ${labelFor("objetivo", answers.objetivo).toLowerCase()}`);
  }
  if (answers.nivel) {
    bullets.push(
      `Tu nivel actual: ${labelFor("entrenamiento", answers.nivel).toLowerCase()}`,
    );
  }
  if (answers.diasSemana && answers.tiempoSesion) {
    bullets.push(
      `Podés entrenar ${answers.diasSemana} días/semana, ${labelFor("tiempoSesion", answers.tiempoSesion).toLowerCase()} por sesión`,
    );
  }
  if (answers.lugar) {
    bullets.push(`Preferís entrenar en ${labelFor("lugar", answers.lugar).toLowerCase()}`);
  }
  if (answers.materiales?.length) {
    bullets.push(`Tenés: ${labelMateriales(answers.materiales)}`);
  }
  if (answers.obstaculo) {
    bullets.push(
      `Necesitás apoyo con: ${labelFor("obstaculo", answers.obstaculo).toLowerCase()}`,
    );
  }

  return bullets;
}

export function buildFallbackSummary(
  answers: ChatbotAnswers,
  planTitle: string,
  planReason: string,
) {
  const bullets = buildSummaryBullets(answers);
  const bulletLines = bullets.map((b) => `✔️ ${b}`).join("\n");

  return `Perfecto${answers.nombre ? `, ${answers.nombre}` : ""}. Esto fue lo que entendí de vos:
${bulletLines}

Según todo lo que me contaste, creo que el plan que mejor se adapta a vos es: **${planTitle}**

${planReason}`;
}

export function detectSmartExtras(answers: ChatbotAnswers): string[] {
  const extras: string[] = [];
  const freeText = [
    answers.motivoAbandono ?? "",
    answers.nombre ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (answers.nivel === "nunca") {
    extras.push(
      "No necesitás experiencia previa: el plan se adapta a tu nivel desde cero.",
    );
  }

  if (
    freeText.includes("mamá") ||
    freeText.includes("mama") ||
    freeText.includes("postparto") ||
    freeText.includes("embarazo")
  ) {
    extras.push(
      "Si sos mamá, Mami Fit está pensado para recuperarte con seguridad y acompañamiento.",
    );
  }

  if (answers.obstaculo === "tiempo" || answers.tiempoSesion === "20" || answers.tiempoSesion === "30") {
    extras.push(
      "Con rutinas de 20-30 minutos podés avanzar sin que el tiempo sea un freno.",
    );
  }

  if (answers.obstaculo === "sola" || answers.obstaculo === "acompanamiento") {
    extras.push(
      "En IVIIS FIT no entrenás sola: hay comunidad y seguimiento para sostenerte.",
    );
  }

  if (answers.obstaculo === "no_comer" || answers.alimentacion === "si") {
    extras.push(
      "El Plan Total incluye guía de alimentación para que sepas qué comer sin complicaciones.",
    );
  }

  return extras;
}

export function getPlanReason(slug: string, answers: ChatbotAnswers): string {
  switch (slug) {
    case "mami-fit":
      return "Porque está pensado para mamás que quieren recuperar fuerza y constancia con un enfoque seguro.";
    case "abs-power":
      return "Porque ya entrenás y buscás trabajar específicamente el core con un plan enfocado.";
    case "gluteos":
      return "Porque entrenás en gimnasio y tu principal objetivo son glúteos y piernas.";
    case "online":
      if (answers.alimentacion === "si" || answers.obstaculo === "no_comer") {
        return "Porque incluye entrenamiento personalizado, alimentación, seguimiento y comunidad.";
      }
      if (answers.nivel === "nunca" || answers.obstaculo === "acompanamiento") {
        return "Porque te acompaña desde tu nivel, con rutina, seguimiento y comunidad.";
      }
      return "Porque combina entrenamiento personalizado, seguimiento y acompañamiento para tu objetivo.";
    default:
      return "Porque se adapta a lo que me contaste sobre tu objetivo, tiempo y disponibilidad.";
  }
}

export function getPlanDisplayName(slug: string, shortTitle: string) {
  if (slug === "online") {
    return `Plan Total / ${shortTitle}`;
  }
  return shortTitle;
}
