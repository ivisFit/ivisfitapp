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

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
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

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const { init: initWithTimeout, cleanup } = applyTimeout(init, DEFAULT_TIMEOUT_MS);

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
    try {
      const text = await response.text();
      if (text.trim()) {
        const body = JSON.parse(text) as { error?: string; message?: string };
        message = body.error ?? body.message ?? message;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status);
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
