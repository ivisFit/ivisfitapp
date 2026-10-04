/**
 * Base URL para `apiFetch`.
 *
 * En el navegador siempre usamos el mismo origen (`""`) para que:
 * - las cookies de Better Auth viajen con la request
 * - el proxy `app/api/[...path]` reenvíe al backend
 * - el CSP (`connect-src 'self'`) no bloquee el fetch
 *
 * `NEXT_PUBLIC_API_URL` / `API_URL` solo sirven en el servidor (proxy / SSR).
 */
export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  // SSR en el mismo proceso Next: llamar al proxy local /api
  if (process.env.PORT) {
    return `http://127.0.0.1:${process.env.PORT}`;
  }

  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000"
  );
}

export type ZodFlattenedError = {
  formErrors?: string[];
  fieldErrors?: Record<string, string[]>;
};

const INVALID_DATA_FALLBACK =
  "Los datos del plan no son válidos. Guardá el borrador y revisá comidas e ingredientes.";

const GENERIC_API_MESSAGES = new Set([
  "Error al comunicarse con el servidor",
  "Error interno del servidor",
  "No se pudo reenviar la solicitud al servidor. Reintentá en unos segundos.",
]);

function describeHttpStatus(status: number): string {
  switch (status) {
    case 401:
      return "Tu sesión expiró o no estás autenticado. Volvé a iniciar sesión.";
    case 403:
      return "No tenés permiso para esta acción.";
    case 404:
      return "No se encontró el recurso solicitado (por ejemplo, la evaluación nutricional).";
    case 413:
      return "La solicitud es demasiado grande.";
    case 502:
      return "No se pudo conectar con el servidor de la API. Si administrás el sitio, revisá que API_URL esté configurado y el backend en marcha.";
    case 500:
      return "Hubo un fallo interno al procesar la solicitud. Reintentá en unos segundos; si persiste, contactá soporte.";
    case 504:
      return "La solicitud tardó demasiado. Intentá de nuevo.";
    default:
      if (status >= 500) {
        return `Error del servidor (código ${status}). Reintentá más tarde.`;
      }
      if (status >= 400) {
        return `Solicitud rechazada (código ${status}).`;
      }
      return "No se pudo completar la solicitud.";
  }
}

export function formatValidationErrorMessage(
  fallback: string,
  details?: unknown,
): string | null {
  if (!details || typeof details !== "object") {
    return fallback === "Datos inválidos" ? INVALID_DATA_FALLBACK : fallback;
  }

  const flattened = details as ZodFlattenedError;
  const parts: string[] = [];

  if (flattened.formErrors?.length) {
    parts.push(...flattened.formErrors);
  }

  if (flattened.fieldErrors) {
    for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
      if (messages?.length) {
        parts.push(`${field}: ${messages.join(", ")}`);
      }
    }
  }

  if (parts.length === 0) {
    return fallback === "Datos inválidos" ? INVALID_DATA_FALLBACK : fallback;
  }

  return parts.join(". ");
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const detailed =
      formatValidationErrorMessage(error.message, error.details) ?? error.message;
    if (GENERIC_API_MESSAGES.has(detailed) || GENERIC_API_MESSAGES.has(error.message)) {
      return describeHttpStatus(error.status);
    }
    return detailed;
  }

  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    if (msg.includes("fetch") || msg.includes("network")) {
      return "No hay conexión con el servidor. Revisá tu internet e intentá de nuevo.";
    }
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "La solicitud tardó demasiado. Intentá de nuevo.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No se pudo completar la solicitud.";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;

function applyTimeout(
  init: RequestInit | undefined,
  timeoutMs: number,
): { init: RequestInit; cleanup: () => void } {
  if (init?.signal) {
    return { init, cleanup: () => {} };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    init: { ...init, signal: controller.signal },
    cleanup: () => clearTimeout(timeoutId),
  };
}

export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
};

export async function apiFetch<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const { timeoutMs, ...requestInit } = init ?? {};

  const headers = new Headers(requestInit.headers);
  if (requestInit.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const { init: initWithTimeout, cleanup } = applyTimeout(
    requestInit,
    timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  let response: Response;
  try {
    response = await fetch(url, {
      ...initWithTimeout,
      credentials: "include",
      headers,
    });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    if (aborted && !init?.signal) {
      throw new ApiError("La solicitud tardó demasiado. Intentá de nuevo.", 504);
    }
    throw error;
  } finally {
    cleanup();
  }

  if (!response.ok) {
    let message = "Error al comunicarse con el servidor";
    let details: unknown;
    const text = await response.text();
    if (text.trim()) {
      try {
        const body = JSON.parse(text) as {
          error?: string;
          message?: string;
          details?: unknown;
        };
        message = body.error ?? body.message ?? message;
        details = body.details;
      } catch {
        const snippet = text.replace(/\s+/g, " ").trim().slice(0, 120);
        message = snippet
          ? `Respuesta no JSON del servidor (código ${response.status}): ${snippet}`
          : `Respuesta no JSON del servidor (código ${response.status}).`;
      }
    }
    throw new ApiError(message, response.status, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Respuesta inválida del servidor", response.status);
  }
}
