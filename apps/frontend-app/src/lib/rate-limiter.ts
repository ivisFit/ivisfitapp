import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}

setInterval(cleanup, 60000);

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator = defaultKeyGenerator } = config;

  return function rateLimiter(request: NextRequest): NextResponse | null {
    const key = keyGenerator(request);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, maxRequests - entry.count);
    const resetTime = Math.ceil(entry.resetTime / 1000);

    const headers = {
      "X-RateLimit-Limit": maxRequests.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": resetTime.toString(),
    };

    if (entry.count > maxRequests) {
      return new NextResponse(
        JSON.stringify({
          error:
            "Demasiadas solicitudes. Esperá unos minutos e intentá de nuevo.",
        }),
        {
          status: 429,
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((entry.resetTime - now) / 1000).toString(),
          },
        },
      );
    }

    return null;
  };
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function defaultKeyGenerator(request: NextRequest): string {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  return `${ip}:${path}`;
}

/** Login / signup / reset — por ruta e IP (no comparte cupo con 2FA). */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return `auth:${ip}:${req.nextUrl.pathname}`;
  },
});

/**
 * 2FA: send/verify OTP necesitan más margen (auto-send + reintentos).
 * Cupo separado del login para no bloquear verificación tras fallos de mail.
 */
export const twoFactorRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 40,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return `2fa:${ip}:${req.nextUrl.pathname}`;
  },
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return `api:${ip}:${req.nextUrl.pathname}`;
  },
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return `strict:${ip}:${req.nextUrl.pathname}`;
  },
});
