export type ChatbotStep =
  | "greeting"
  | "nombre"
  | "genero"
  | "objetivo"
  | "entrenamiento"
  | "motivoAbandono"
  | "diasSemana"
  | "tiempoSesion"
  | "lugar"
  | "materiales"
  | "alimentacion"
  | "obstaculo"
  | "confianza"
  | "email"
  | "whatsapp"
  | "fuente"
  | "resumen"
  | "done";

export type ChatbotAnswers = {
  nombre?: string;
  genero?: string;
  objetivo?: string;
  nivel?: string;
  motivoAbandono?: string;
  diasSemana?: string;
  tiempoSesion?: string;
  lugar?: string;
  materiales?: string[];
  alimentacion?: string;
  obstaculo?: string;
  confianza?: number;
  email?: string;
  whatsapp?: string;
  fuente?: string;
};

export type ChatbotMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export type ChipOption = {
  value: string;
  label: string;
};

export type RecommendedPlan = {
  slug: string;
  title: string;
  shortTitle: string;
  route: string;
  displayName: string;
  investment: string;
};

export type ChatbotTurnResponse = {
  assistantMessage: string;
  nextStep: ChatbotStep;
  inputType: "none" | "text" | "chips" | "multi-chips";
  options?: ChipOption[];
  placeholder?: string;
  recommendedPlan?: RecommendedPlan;
  leadId?: string;
  resumenTexto?: string;
  showCtAs?: boolean;
  processing?: boolean;
  jobId?: string;
};

export type ChatbotTurnStatusResponse = {
  status: "processing" | "done" | "error";
  result?: ChatbotTurnResponse;
  error?: string;
};

const SESSION_KEY = "ivisfit-chatbot-session-v2";
const STATE_KEY = "ivisfit-chatbot-state-v2";

export function getOrCreateSessionId() {
  if (typeof window === "undefined") return crypto.randomUUID();
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export function resetChatbotSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(STATE_KEY);
  }
}

export type PersistedChatbotState = {
  sessionId: string;
  messages: ChatbotMessage[];
  currentStep: ChatbotStep;
  answers: ChatbotAnswers;
  inputType: ChatbotTurnResponse["inputType"];
  options?: ChipOption[];
  placeholder?: string;
  recommendedPlan?: RecommendedPlan;
  resumenTexto?: string;
  showCtAs: boolean;
  started: boolean;
};

export function saveChatbotState(state: PersistedChatbotState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage puede fallar en modo privado; no es crítico
  }
}

export function loadChatbotState(sessionId: string): PersistedChatbotState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedChatbotState;
    if (parsed.sessionId !== sessionId || !parsed.messages?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}
