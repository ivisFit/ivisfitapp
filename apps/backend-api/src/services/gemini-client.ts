import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-2.5-flash";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const GEMINI_REQUEST_TIMEOUT_MS = envInt(
  "GEMINI_REQUEST_TIMEOUT_MS",
  90_000,
);
export const GEMINI_MAX_RETRIES = envInt("GEMINI_MAX_RETRIES", 1);

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

export type GenerateGeminiTextOptions = {
  instruction: string;
  systemInstruction: string;
  fallback: string;
  maxOutputTokens?: number;
  temperature?: number;
  requiredSubstring?: string;
  responseMimeType?: string;
  thinkingBudget?: number;
  logLabel?: string;
};

function isTruncatedResponse(
  finishReason: string | undefined,
  text: string,
  requiredSubstring?: string,
): boolean {
  if (finishReason === "MAX_TOKENS") return true;
  if (requiredSubstring && !text.includes(requiredSubstring)) return true;
  return false;
}

export async function generateGeminiText({
  instruction,
  systemInstruction,
  fallback,
  maxOutputTokens = 1024,
  temperature = 0.6,
  requiredSubstring,
  responseMimeType,
  thinkingBudget,
  logLabel = "gemini-client",
}: GenerateGeminiTextOptions): Promise<string> {
  const client = getGeminiClient();
  if (!client) return fallback;

  for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      GEMINI_REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await client.models.generateContent({
        model: getGeminiModel(),
        contents: instruction,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens,
          responseMimeType,
          thinkingConfig:
            thinkingBudget === undefined
              ? { thinkingBudget: 0 }
              : { thinkingBudget },
          abortSignal: controller.signal,
        },
      });

      const text = response.text?.trim();
      if (!text) return fallback;

      const finishReason = response.candidates?.[0]?.finishReason;
      if (isTruncatedResponse(finishReason, text, requiredSubstring)) {
        console.warn(
          `[${logLabel}] truncated response (finishReason=${finishReason ?? "unknown"})`,
        );
        return fallback;
      }

      return text;
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      // No reintentamos si fue timeout: la generación tardó demasiado y
      // reejecutarla solo duplicaría la espera. Sí reintentamos errores
      // transitorios (red / 5xx / 429).
      if (attempt < GEMINI_MAX_RETRIES && !timedOut) continue;
      console.error(
        `[${logLabel}] generateContent failed:`,
        error instanceof Error ? error.message : error,
      );
      return fallback;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return fallback;
}
